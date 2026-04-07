document.addEventListener('DOMContentLoaded', () => {
    const algoSelect = document.getElementById('algorithm');
    const keyGroup = document.getElementById('key-group');
    const keyInput = document.getElementById('key');
    const keyLabel = document.getElementById('key-label');
    const form = document.getElementById('sim-form');
    const btnText = document.getElementById('btn-text');
    const speedSlider = document.getElementById('anim-speed');
    const speedLabel = document.getElementById('speed-label');

    // UI Elements
    const stepsOutput = document.getElementById('steps-output');
    const encryptedOutput = document.getElementById('encrypted-output');
    const decryptedOutput = document.getElementById('decrypted-output');
    const decryptGroup = document.getElementById('decrypt-group');

    // Canvas UI
    const flowBar = document.getElementById('flow-bar');
    const charStrip = document.getElementById('char-strip');
    const cryptoStatus = document.getElementById('crypto-status');

    let baseDelay = 200;

    speedSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val == 1) { speedLabel.innerText = "1x"; baseDelay = 300; }
        else if (val == 2) { speedLabel.innerText = "2x"; baseDelay = 150; }
        else if (val == 3) { speedLabel.innerText = "5x"; baseDelay = 50; }
        else { speedLabel.innerText = "Instant"; baseDelay = 0; }
    });

    // Handle Algorithm Change Logic
    algoSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        keyGroup.classList.remove('hidden');
        keyInput.required = true;

        // Hide all visuals initially
        document.querySelectorAll('[id$="-visuals"]').forEach(el => el.style.display = 'none');
        document.getElementById(`${val}-visuals`) && (document.getElementById(`${val}-visuals`).style.display = 'flex');

        charStrip.innerHTML = '';
        flowBar.style.opacity = '0';
        stepsOutput.innerHTML = '';

        switch (val) {
            case 'caesar':
                keyLabel.innerHTML = '<i class="fa-solid fa-key"></i> Shift Value (Integer)';
                keyInput.type = 'number';
                keyInput.placeholder = 'e.g. 3';
                cryptoStatus.innerText = "Ready for Caesar Shift...";
                break;
            case 'vigenere':
                keyLabel.innerHTML = '<i class="fa-solid fa-key"></i> Key String (Alphabetic)';
                keyInput.type = 'text';
                keyInput.placeholder = 'e.g. SECRET';
                cryptoStatus.innerText = "Ready for Vigenère Grid...";
                break;
            case 'aes':
                keyLabel.innerHTML = '<i class="fa-solid fa-key"></i> Secret Key';
                keyInput.type = 'text';
                keyInput.placeholder = 'Enter secret password';
                cryptoStatus.innerText = "Ready for AES-256 S-Box Expansion...";
                break;
            case 'rsa':
                keyGroup.classList.add('hidden');
                keyInput.required = false;
                cryptoStatus.innerText = "Ready for RSA Prime Generation...";
                break;
            case 'sha256':
                keyGroup.classList.add('hidden');
                keyInput.required = false;
                cryptoStatus.innerText = "Ready for SHA-256 Hashing...";
                break;
            default:
                keyGroup.classList.add('hidden');
                keyInput.required = false;
        }
    });

    // Export delay utility to window for anim instances
    window.animDelay = () => new Promise(res => setTimeout(res, baseDelay));
    window.getBaseDelay = () => baseDelay;

    // Form Submit Logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset UI
        btnText.innerText = "Processing Cipher...";
        stepsOutput.innerHTML = '';
        encryptedOutput.value = '';
        decryptedOutput.value = '';
        decryptGroup.classList.remove('hidden');
        
        cryptoStatus.innerText = "Running Cryptographic Algorithms...";
        cryptoStatus.style.color = "var(--accent)";
        flowBar.style.opacity = '0';
        charStrip.innerHTML = '';
        
        const inputText = document.getElementById('plaintext').value;
        const algo = algoSelect.value;
        const keyVal = keyInput.value;

        try {
            const response = await fetch('/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    algorithm: algo,
                    key: keyVal
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Server error occurred");
            }

            flowBar.innerText = `${inputText} → ${data.encrypted}`;
            flowBar.style.opacity = '1';

            // Route execution to specific algorithm visualizers
            if (algo === 'caesar' && window.AnimCaesar) {
                await window.AnimCaesar.execute(inputText, data, stepsOutput, charStrip);
            } else if (algo === 'vigenere' && window.AnimVigenere) {
                await window.AnimVigenere.execute(inputText, data, stepsOutput, charStrip);
            } else if (algo === 'aes' && window.AnimAES) {
                await window.AnimAES.execute(inputText, data, stepsOutput, charStrip);
            } else if (algo === 'rsa' && window.AnimRSA) {
                await window.AnimRSA.execute(inputText, data, stepsOutput, charStrip);
            } else if (algo === 'sha256' && window.AnimSHA) {
                await window.AnimSHA.execute(inputText, data, stepsOutput, charStrip);
            } else {
                // Fallback for missing anim module (use basic one)
                await fallbackAnimation(inputText, data, stepsOutput, charStrip);
            }

            cryptoStatus.innerText = "Encryption Complete!";
            cryptoStatus.style.color = "var(--success)";

            // Output Results
            encryptedOutput.value = data.encrypted || '';
            if (algo === 'sha256') {
                decryptGroup.classList.add('hidden');
            } else {
                decryptedOutput.value = data.decrypted || '';
            }

        } catch (error) {
            stepsOutput.innerHTML = `<div class="transform-card" style="border-left-color: var(--error); display:block;"><span style="color:var(--error);"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${error.message}</span></div>`;
            cryptoStatus.innerText = "Encryption Failed!";
            cryptoStatus.style.color = "var(--error)";
        } finally {
            btnText.innerText = "Run Simulation";
        }
    });

    async function fallbackAnimation(input, data, stepsCont, charCont) {
        if (!data.steps) return;
        for (let i = 0; i < data.steps.length; i++) {
            const card = document.createElement("div");
            card.className = "transform-card";
            card.style.display = "block";
            card.innerHTML = `<span style="color:var(--text-secondary); font-size: 14px;">${data.steps[i]}</span>`;
            stepsCont.appendChild(card);
            stepsCont.scrollTop = stepsCont.scrollHeight;
            if(window.getBaseDelay() > 0) await window.animDelay();
        }
    }
});
