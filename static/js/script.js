document.addEventListener('DOMContentLoaded', () => {
    const algoSelect = document.getElementById('algorithm');
    const keyGroup = document.getElementById('key-group');
    const keyInput = document.getElementById('key');
    const keyLabel = document.getElementById('key-label');
    const form = document.getElementById('sim-form');
    const btnText = document.getElementById('btn-text');

    // UI Elements
    const stepsOutput = document.getElementById('steps-output');
    const encryptedOutput = document.getElementById('encrypted-output');
    const decryptedOutput = document.getElementById('decrypted-output');
    const decryptGroup = document.getElementById('decrypt-group');

    // Center Panel UI
    const flowBar = document.getElementById('flow-bar');
    const charStrip = document.getElementById('char-strip');
    const cryptoStatus = document.getElementById('crypto-status');

    // Handle Algorithm Change Logic
    algoSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        keyGroup.classList.remove('hidden');
        keyInput.required = true;

        switch (val) {
            case 'caesar':
                keyLabel.innerHTML = '<i class="fa-solid fa-key"></i> Shift Value (Integer)';
                keyInput.type = 'number';
                keyInput.placeholder = 'e.g. 3';
                break;
            case 'vigenere':
                keyLabel.innerHTML = '<i class="fa-solid fa-key"></i> Key String (Alphabetic)';
                keyInput.type = 'text';
                keyInput.placeholder = 'e.g. SECRET';
                break;
            case 'aes':
                keyLabel.innerHTML = '<i class="fa-solid fa-key"></i> Secret Key';
                keyInput.type = 'text';
                keyInput.placeholder = 'Enter secret password';
                break;
            case 'rsa':
                keyGroup.classList.add('hidden');
                keyInput.required = false;
                break;
            case 'sha256':
                keyGroup.classList.add('hidden');
                keyInput.required = false;
                break;
            default:
                keyGroup.classList.add('hidden');
                keyInput.required = false;
        }
    });

    const delay = ms => new Promise(res => setTimeout(res, ms));

    function parseStep(step) {
        const match = step.match(/'(.+?)'.*?(?:→|->|to).*?'(.+?)'$/);
        if (!match) return null;

        return {
            from: match[1],
            to: match[2]
        };
    }

    function renderStrip(input, output) {
        let inputSpanHTML = input.split('').map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
        let outputSpanHTML = output.split('').map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
        
        // If the lengths are drastically different (e.g. AES/RSA), just show standard text blocks or limit chars
        if(output.length > input.length * 5) {
             inputSpanHTML = input.split('').slice(0,10).map(c => `<span>${c}</span>`).join('') + (input.length>10?'<span>...</span>':'');
             outputSpanHTML = output.split('').slice(0,10).map(c => `<span>${c}</span>`).join('') + (output.length>10?'<span>...</span>':'');
        }

        charStrip.innerHTML = `
            <div class="row">${inputSpanHTML}</div>
            <div style="font-size: 24px; color: var(--border-color);"><i class="fa-solid fa-arrow-down"></i></div>
            <div class="row" style="margin-bottom: 20px;">${outputSpanHTML}</div>
        `;
    }

    async function animateSteps(steps) {
        if (!steps || steps.length === 0) return;
        
        for (let i = 0; i < steps.length; i++) {
            if (!steps[i]) continue;
            
            const parsed = parseStep(steps[i]);
            const card = document.createElement("div");
            card.className = "transform-card";

            if (parsed) {
                card.innerHTML = `
                    <div class="char">${parsed.from}</div>
                    <div class="arrow">→</div>
                    <div class="char result">${parsed.to}</div>
                `;
            } else {
                // Fallback for AES, RSA, SHA calculations which are non-character mappings
                card.style.display = "block";
                card.style.fontSize = "14px";
                card.style.lineHeight = "1.4";
                card.style.padding = "15px";
                const cleanStr = steps[i].replace(/^\[\d+\]\s*/, '');
                card.innerHTML = `<span style="color:var(--text-secondary);">${cleanStr}</span>`;
            }

            stepsOutput.appendChild(card);
            stepsOutput.scrollTop = stepsOutput.scrollHeight;
            
            await delay(200);
        }
    }

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

        try {
            const response = await fetch('/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    algorithm: algoSelect.value,
                    key: keyInput.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Server error occurred");
            }

            // Top flowbar input to output summary
            flowBar.innerText = `${inputText} → ${data.encrypted}`;
            flowBar.style.opacity = '1';

            // Start step-by-step logic
            await animateSteps(data.steps);

            // Once steps finish, show character strip result
            await delay(500);
            renderStrip(inputText, data.encrypted);
            cryptoStatus.innerText = "Encryption Complete!";
            cryptoStatus.style.color = "var(--success)";

            // Output Results
            encryptedOutput.value = data.encrypted || '';
            if (algoSelect.value === 'sha256') {
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
});
