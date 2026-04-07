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
    
    // Visualization Elements
    const packet = document.getElementById('packet');
    const statusIndicator = document.getElementById('status-indicator');
    const senderNode = document.getElementById('sender-node');
    const receiverNode = document.getElementById('receiver-node');

    // Handle Algorithm Change Logic
    algoSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        keyGroup.classList.remove('hidden');
        keyInput.required = true;
        
        switch(val) {
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
                keyGroup.classList.add('hidden'); // RSA generates its own pairs in our sim
                keyInput.required = false;
                break;
            case 'sha256':
                keyGroup.classList.add('hidden'); // Hashing doesn't need external key here
                keyInput.required = false;
                break;
            default:
                keyGroup.classList.add('hidden');
                keyInput.required = false;
        }
    });

    // Form Submit Logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset Visuals
        btnText.innerText = "Simulating...";
        stepsOutput.innerHTML = '<div class="step-line" style="color: var(--text-secondary);">Initializing...</div>';
        encryptedOutput.value = '';
        decryptedOutput.value = '';
        decryptGroup.classList.remove('hidden');
        
        // Start animation
        packet.classList.add('animate');
        statusIndicator.innerText = "Encrypting & Transmitting...";
        statusIndicator.classList.add('active');
        senderNode.style.borderColor = "var(--success)";
        senderNode.style.boxShadow = "0 0 20px var(--success)";

        try {
            const response = await fetch('/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: document.getElementById('plaintext').value,
                    algorithm: algoSelect.value,
                    key: keyInput.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Server error occurred");
            }

            // Simulate slight delay for visualization impact
            setTimeout(() => {
                // Populate Output Fields
                encryptedOutput.value = data.encrypted || '';
                
                if (algoSelect.value === 'sha256') {
                    // Hashing has no decryption
                    decryptGroup.classList.add('hidden');
                } else {
                    decryptedOutput.value = data.decrypted || '';
                }

                // Populate Steps Text
                stepsOutput.innerHTML = '';
                if(data.steps && data.steps.length > 0) {
                    data.steps.forEach((step, index) => {
                        const div = document.createElement('div');
                        div.className = 'step-line fade-in';
                        div.style.animationDelay = `${index * 0.05}s`;
                        // Basic escaping to prevent HTML injection issues from steps text
                        div.textContent = step; 
                        stepsOutput.appendChild(div);
                    });
                }
                
                // End Network Viz
                senderNode.style.borderColor = "var(--accent)";
                senderNode.style.boxShadow = "0 0 15px var(--glow)";
                receiverNode.style.borderColor = "var(--success)";
                receiverNode.style.boxShadow = "0 0 20px var(--success)";
                statusIndicator.innerText = "Transmission Complete & Secured";
                
                setTimeout(() => {
                    packet.classList.remove('animate');
                    receiverNode.style.borderColor = "var(--accent)";
                    receiverNode.style.boxShadow = "0 0 15px var(--glow)";
                    statusIndicator.classList.remove('active');
                    statusIndicator.innerText = "Idle";
                }, 1500);

            }, 800);

        } catch (error) {
            stepsOutput.innerHTML = `<div class="step-line" style="color: var(--error);">Error: ${error.message}</div>`;
            statusIndicator.innerText = "Transmission Failed";
            statusIndicator.classList.remove('active');
            statusIndicator.style.color = "var(--error)";
            statusIndicator.style.borderColor = "var(--error)";
            packet.classList.remove('animate');
        } finally {
            btnText.innerText = "Run Simulation";
        }
    });
});
