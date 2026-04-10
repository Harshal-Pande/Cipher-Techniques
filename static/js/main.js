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
    const decryptBtn = document.getElementById('run-decrypt-btn');

    // Canvas UI
    const flowBar = document.getElementById('flow-bar');
    const charStrip = document.getElementById('char-strip');
    const cryptoStatus = document.getElementById('crypto-status');
    const techInfo = document.getElementById('tech-info');
    const stepsPanel = document.getElementById('steps-panel');
    const stepsLog = document.getElementById('steps-log');
    const plaintextArea = document.getElementById('plaintext');
    const btnToggleDesc = document.getElementById('btn-toggle-desc');
    const btnToggleStepsHeader = document.getElementById('btn-toggle-steps-header');
    const btnCopySteps = document.getElementById('btn-copy-steps');
    const btnStepsExpand = document.getElementById('btn-steps-expand');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');

    let baseDelay = 200;

    speedSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val == 1) { speedLabel.innerText = "1x"; baseDelay = 300; }
        else if (val == 2) { speedLabel.innerText = "2x"; baseDelay = 150; }
        else if (val == 3) { speedLabel.innerText = "5x"; baseDelay = 50; }
        else { speedLabel.innerText = "Instant"; baseDelay = 0; }
        schedulePersist();
    });

    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');

    // Allow deep-links from Home page
    const params = new URLSearchParams(window.location.search);
    const deepAlgo = params.get('algo');
    const deepMode = params.get('mode'); // 'anim' | 'quiz'

    const TECHNIQUE_DICT = {
        caesar: {
            title: 'Caesar Cipher (Substitution)',
            lead: 'Each letter is replaced by another letter a fixed number of positions away in the alphabet. Wrap-around uses modular arithmetic (mod 26), so Z can become C with a shift of 3.',
            bullets: [
                'Classic teaching cipher: easy to visualize but trivial to break (only ~25 meaningful shifts for English).',
                'Non-letters (digits, spaces, punctuation) are usually left unchanged in this simulator.',
                'Decryption applies the same idea with a negative shift (or 26 − N).'
            ],
            detail: 'In real systems Caesar is obsolete; modern apps use AES or stream ciphers. Still useful to understand indexing, modular reduction, and brute-force search.',
            example: 'Example (shift 3): HELLO → KHOOR',
            modalHtml: '<p>Julius Caesar reportedly used shifts of 3 on Latin messages. Today the same pattern illustrates how <strong>symmetric</strong> substitution works before you add keys and diffusion.</p><h4>What you should notice in the lab</h4><ul><li>Plain letter → position index (0–25)</li><li>Add shift modulo 26</li><li>Map back to a letter</li></ul><h4>Limitations</h4><p>Letter frequency in ciphertext still matches English (E, T, A…), so frequency analysis breaks it quickly.</p>'
        },
        aes: {
            title: 'AES-256 (Symmetric Block Cipher)',
            lead: 'AES encrypts data in fixed 128-bit blocks. AES-256 uses a 256-bit key and multiple rounds of well-defined operations that mix and obscure bits across the whole block.',
            bullets: [
                'This demo uses AES-256 in CBC mode: a random IV makes identical plaintext blocks produce different ciphertext blocks.',
                'PKCS#7 padding extends the message so its length is a multiple of the block size before encryption.',
                'Output here is Base64 (IV + ciphertext) so it can be copied safely in text tools.'
            ],
            detail: 'AES is the workhorse of TLS, disk encryption, and VPNs. The animation highlights the idea of rounds (SubBytes, ShiftRows, MixColumns, AddRoundKey) without drawing every gate.',
            example: 'Concept: one block of plaintext bytes → rounds under key schedule → opaque ciphertext bytes.',
            modalHtml: '<p>The Advanced Encryption Standard (AES) replaced DES for most purposes. It is <strong>symmetric</strong>: the same secret key encrypts and decrypts (unlike RSA).</p><h4>CBC in one sentence</h4><p>Each plaintext block is XORed with the previous ciphertext block (first block uses the IV), then encrypted—so patterns in plaintext do not repeat visibly in ciphertext.</p><h4>Why you see hex and Base64</h4><p>Binary ciphertext is shown as hex for debugging; Base64 is a text-safe transport encoding, not extra encryption.</p>'
        },
        vigenere: {
            title: 'Vigenère Cipher (Polyalphabetic)',
            lead: 'Instead of one shift for the whole message, a repeating keyword picks a different Caesar shift per letter. That smooths letter-frequency spikes compared to pure Caesar.',
            bullets: [
                'Only alphabetic positions consume key letters; spaces and punctuation typically skip the key advance (as in this project).',
                'Encryption: (plain_index + key_index) mod 26. Decryption subtracts the key index.',
                'Still breakable for long texts (Kasiski / Friedman tests) but historically marked a step toward modern polyalphabetic ideas.'
            ],
            detail: 'Use the lab to watch per-character key alignment, index math, and ciphertext growth side by side.',
            example: 'Classic table example: ATTACK with key LEMON → LXFOPV (case follows plaintext).',
            modalHtml: '<p>The Vigenère square is a grid of shifted alphabets. Implementations often use modular addition on indices instead of looking up the table by hand.</p><h4>Compared to Caesar</h4><p>Multiple shifts defeat simple frequency counts on single letters, but repeated key length leaks structure if the message is long enough.</p>'
        },
        rsa: {
            title: 'RSA-2048 (Asymmetric Public-Key)',
            lead: 'RSA uses a public modulus n and a public exponent e to encrypt, and a private exponent d (with the same n) to decrypt. Security rests on the hardness of factoring n into primes p and q.',
            bullets: [
                'This simulator generates a fresh key pair per run and shows p, q, n, e, d in the step log for learning.',
                'OAEP padding (with SHA-256 here) randomizes encryptions of the same plaintext and blocks several attacks.',
                'RSA is relatively slow; protocols usually encrypt only a small secret (e.g. an AES key) and then use AES for bulk data.'
            ],
            detail: 'Watch the pipeline: key material (primes → modulus → exponents), then message → padded integer → modular exponentiation → Base64 ciphertext.',
            example: 'Concept: C ≡ M^e (mod n), recover M with M ≡ C^d (mod n) using the private key.',
            modalHtml: '<p>RSA is <strong>asymmetric</strong>: encrypt with the public key, decrypt with the private key (or sign with private, verify with public).</p><h4>Why big numbers</h4><p>2048-bit n is chosen so that known factoring algorithms are infeasible today. The simulator exposes numbers for education; production systems store keys in secure modules.</p><h4>OAEP</h4><p>Optimal Asymmetric Encryption Padding embeds randomness and structure so raw modular exponentiation is not applied to raw message integers.</p>'
        },
        sha256: {
            title: 'SHA-256 (Cryptographic Hash)',
            lead: 'SHA-256 maps arbitrary-length input to a 256-bit fingerprint (shown as 64 hex characters). It is one-way: you cannot “decrypt” a hash back to the original message.',
            bullets: [
                'Small input changes flip roughly half the hash bits (avalanche effect)—ideal for integrity checks.',
                'Used in downloads (checksums), Git commits, certificate fingerprints, and inside HMAC and many protocols.',
                'This simulator has no decrypt button because hashing is not reversible.'
            ],
            detail: 'Compare the hash of your message with a one-character variant to see how sensitive the output is.',
            example: 'Example: "hello" → a fixed 64-hex digest; change one letter → completely different digest.',
            modalHtml: '<p>A <strong>hash function</strong> should be fast to compute, hard to invert, and collision-resistant (hard to find two inputs with the same digest).</p><h4>Not encryption</h4><p>There is no secret key in basic SHA-256; anyone can recompute the hash of a candidate message. For keyed integrity use HMAC.</p><h4>Avalanche</h4><p>The demo perturbs your input slightly so you can count how many hex digits change—usually close to half of 64.</p>'
        }
    };

    function escapeHtml(str) {
        return (str == null ? '' : String(str))
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setTechniqueInfo(algo) {
        if (!techInfo) return;
        techInfo.classList.remove('show');
        techInfo.innerHTML = '';
        techInfo.dataset.selectedAlgo = algo || '';
        /* Full text lives in TECHNIQUE_DICT — use "Description" button for the modal only (saves canvas height). */
    }

    function buildDescModalHtml(info) {
        if (!info) return '<p>Select an algorithm to read its description.</p>';
        const bulletsHtml = info.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('');
        return `
            <p class="tech-lead">${escapeHtml(info.lead)}</p>
            <h4>Key ideas</h4>
            <ul>${bulletsHtml}</ul>
            <h4>More detail</h4>
            <p>${escapeHtml(info.detail)}</p>
            ${info.modalHtml || ''}
            <div class="example-block"><strong>Worked example:</strong> ${escapeHtml(info.example)}</div>
        `;
    }

    function openModal(title, text, opts) {
        if (!modalOverlay || !modalTitle || !modalBody) return;
        modalTitle.innerText = title || 'Details';
        const asHtml = opts && opts.html;
        modalBody.classList.toggle('modal-body--html', !!asHtml);
        if (asHtml) modalBody.innerHTML = text || '';
        else {
            modalBody.innerHTML = '';
            modalBody.innerText = text || '';
        }
        modalOverlay.classList.remove('hidden');
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.add('hidden');
        if (modalBody) {
            modalBody.classList.remove('modal-body--html');
            modalBody.innerHTML = '';
        }
    }

    function setStepsText(title, steps) {
        if (!stepsLog) return;
        const countEl = document.getElementById('steps-line-count');
        const titleEl = document.getElementById('steps-toolbar-title');

        if (!steps || steps.length === 0) {
            stepsLog.innerHTML = '';
            window.__stepsPlainText = '';
            window.__lastStepsSnapshot = { title: '', steps: [] };
            if (stepsPanel) stepsPanel.classList.add('is-empty');
            if (countEl) countEl.textContent = '';
            if (titleEl) titleEl.textContent = 'Operation steps';
            schedulePersist();
            return;
        }

        if (stepsPanel) stepsPanel.classList.remove('is-empty');
        if (titleEl) titleEl.textContent = title || 'Operation steps';
        if (countEl) countEl.textContent = `${steps.length} lines`;

        const rows = steps.map((s) => {
            const t = s.toString();
            let cls = 'steps-line';
            const tr = t.trim();
            if (/^─{3,}$/.test(tr)) cls += ' steps-line--rule';
            else if (/STEP\s*\d/i.test(t)) cls += ' steps-line--step';
            else if (/^[📌🔓🔑📥✅⚡🔐📡🎲⚙️🔄📊]/.test(t)) cls += ' steps-line--flag';
            return `<div class="${cls}">${escapeHtml(t)}</div>`;
        }).join('');
        stepsLog.innerHTML = rows;

        const head = title ? `${title}\n${'─'.repeat(Math.min(48, (title || '').length))}\n\n` : '';
        window.__stepsPlainText = head + steps.map((s) => s.toString()).join('\n');
        window.__lastStepsSnapshot = { title: title || '', steps: steps.map((s) => s.toString()) };
        schedulePersist();
    }

    function openStepsModal() {
        const body = (window.__stepsPlainText || '').trim();
        openModal('Full operation steps', body || '(No steps yet — run Encrypt.)', { html: false });
    }

    // Modal open buttons (Description + Steps)
    if (btnToggleDesc) {
        btnToggleDesc.addEventListener('click', () => {
            const algo = algoSelect.value;
            const info = TECHNIQUE_DICT[algo];
            if (!info) {
                openModal('Technique description', 'Select an algorithm from the list first.', { html: false });
                return;
            }
            openModal(`${info.title} — full description`, buildDescModalHtml(info), { html: true });
        });
    }
    if (btnToggleStepsHeader) {
        btnToggleStepsHeader.addEventListener('click', openStepsModal);
    }
    if (btnStepsExpand) {
        btnStepsExpand.addEventListener('click', openStepsModal);
    }
    if (btnCopySteps) {
        btnCopySteps.addEventListener('click', async () => {
            const t = (window.__stepsPlainText || '').trim();
            if (!t) return;
            try {
                await navigator.clipboard.writeText(t);
                btnCopySteps.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
                window.setTimeout(() => {
                    btnCopySteps.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                }, 1600);
            } catch {
                openModal('Copy steps', t, { html: false });
            }
        });
    }
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    btnPlay.addEventListener('click', () => {
        btnPlay.classList.add('active');
        btnPause.classList.remove('active');
        if (window.quizEngine) window.quizEngine.enabled = false;
    });

    if (btnPause) {
        btnPause.addEventListener('click', () => {
            // legacy (quiz overlay removed)
        });
    }

    let restoringState = false;

    // Handle Algorithm Change Logic
    algoSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        keyGroup.classList.remove('hidden');
        keyInput.required = true;

        // Hide all visuals initially
        document.querySelectorAll('[id$="-visuals"]').forEach(el => el.style.display = 'none');
        document.getElementById(`${val}-visuals`) && (document.getElementById(`${val}-visuals`).style.display = 'flex');

        charStrip.innerHTML = '';
        if (!restoringState) flowBar.style.opacity = '0';
        stepsOutput.innerHTML = '';
        setTechniqueInfo(val);
        if (!restoringState) setStepsText('', []);

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
        if (!restoringState) schedulePersist();
    });

    // Export delay utility to window for anim instances
    window.animDelay = () => new Promise(res => setTimeout(res, baseDelay));
    window.getBaseDelay = () => baseDelay;
    // GSAP duration scaler (slower when baseDelay is higher)
    // 1x => 1.0, 2x => 0.6, 5x => 0.3, instant => 0.15
    window.getAnimScale = () => {
        if (baseDelay === 0) return 0.15;
        return Math.min(1.2, Math.max(0.25, baseDelay / 300));
    };

    let cacheData = null;
    let cacheInputText = "";
    let cacheAlgo = "";

    let persistTimer = null;
    function schedulePersist() {
        if (!window.CryptolabStorage) return;
        if (persistTimer) clearTimeout(persistTimer);
        persistTimer = setTimeout(() => {
            persistTimer = null;
            const snap = window.__lastStepsSnapshot || { title: '', steps: [] };
            window.CryptolabStorage.saveSimulator({
                algorithm: algoSelect.value,
                plaintext: plaintextArea ? plaintextArea.value : '',
                key: keyInput.value,
                speedSlider: speedSlider.value,
                encryptedOutput: encryptedOutput.value,
                decryptedOutput: decryptedOutput.value,
                cacheData,
                cacheInputText,
                cacheAlgo,
                flowBarText: flowBar ? flowBar.innerText : '',
                flowBarVisible: !!(flowBar && flowBar.style.opacity === '1'),
                lastStepsTitle: snap.title,
                lastSteps: snap.steps
            });
        }, 450);
    }

    function applyLoadedState(st) {
        if (!st || !st.algorithm) return;
        restoringState = true;
        if (plaintextArea && st.plaintext != null) plaintextArea.value = st.plaintext;
        if (st.key != null) keyInput.value = st.key;
        if (st.speedSlider && speedSlider) {
            speedSlider.value = st.speedSlider;
            speedSlider.dispatchEvent(new Event('input'));
        }
        const has = Array.from(algoSelect.options).some(o => o.value === st.algorithm);
        if (has) {
            algoSelect.value = st.algorithm;
            algoSelect.dispatchEvent(new Event('change'));
        }
        restoringState = false;
        if (st.encryptedOutput != null) encryptedOutput.value = st.encryptedOutput;
        if (st.decryptedOutput != null) decryptedOutput.value = st.decryptedOutput;
        if (st.cacheData && st.cacheAlgo) {
            cacheData = st.cacheData;
            cacheInputText = st.cacheInputText || '';
            cacheAlgo = st.cacheAlgo;
            if (decryptBtn) {
                decryptBtn.disabled = st.cacheAlgo === 'sha256' || !st.cacheData;
            }
        }
        if (flowBar && st.flowBarText) {
            flowBar.innerText = st.flowBarText;
            flowBar.style.opacity = st.flowBarVisible ? '1' : '0';
        }
        if (Array.isArray(st.lastSteps) && st.lastSteps.length) {
            setStepsText(st.lastStepsTitle || 'Saved steps', st.lastSteps);
        }
    }

    if (plaintextArea) {
        plaintextArea.addEventListener('input', schedulePersist);
    }
    keyInput.addEventListener('input', schedulePersist);

    const savedSim = window.CryptolabStorage && window.CryptolabStorage.loadSimulator();
    if (savedSim) applyLoadedState(savedSim);

    if (deepMode === 'anim') btnPlay.click();
    if (deepAlgo && algoSelect) {
        const has = Array.from(algoSelect.options).some(o => o.value === deepAlgo);
        if (has) {
            restoringState = true;
            algoSelect.value = deepAlgo;
            algoSelect.dispatchEvent(new Event('change'));
            restoringState = false;
        }
    }

    // Form Submit Logic (Encrypt Phase)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset UI
        btnText.innerText = "Encrypting...";
        stepsOutput.innerHTML = '';
        encryptedOutput.value = '';
        decryptedOutput.value = '';
        if (decryptBtn) decryptBtn.disabled = true;
        
        cryptoStatus.innerText = "Running Encryption Data Flow...";
        cryptoStatus.style.color = "var(--accent)";
        flowBar.style.opacity = '0';
        charStrip.innerHTML = '';
        setStepsText('', []);
        
        const inputText = document.getElementById('plaintext').value;
        const algo = algoSelect.value;
        const keyValRaw = keyInput.value ?? '';
        const keyVal = keyValRaw.toString().trim();

        // Client-side validation to avoid 400s and give clearer UI feedback
        if (algo === 'vigenere' && (!keyVal || !/^[a-zA-Z]+$/.test(keyVal))) {
            cryptoStatus.innerText = "Encryption Failed! Vigenère key must be alphabetic.";
            cryptoStatus.style.color = "var(--error)";
            setStepsText('Validation error', ["Vigenère key must contain only letters A-Z (no spaces/numbers)."]);
            btnText.innerText = "Encrypt";
            return;
        }
        if (algo === 'caesar' && (keyVal === '' || Number.isNaN(parseInt(keyVal, 10)))) {
            cryptoStatus.innerText = "Encryption Failed! Caesar key must be an integer shift.";
            cryptoStatus.style.color = "var(--error)";
            setStepsText('Validation error', ["Caesar key must be an integer (e.g., 3)."]);
            btnText.innerText = "Encrypt";
            return;
        }
        if (algo === 'aes' && !keyVal) {
            cryptoStatus.innerText = "Encryption Failed! AES key is required.";
            cryptoStatus.style.color = "var(--error)";
            setStepsText('Validation error', ["AES key/password cannot be empty."]);
            btnText.innerText = "Encrypt";
            return;
        }

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

            cacheData = data;
            cacheInputText = inputText;
            cacheAlgo = algo;

            const left = (inputText || '').toString();
            const right = (data.encrypted || '').toString();
            const rightShort = right.length > 46 ? `${right.slice(0, 46)}…` : right;
            flowBar.innerText = `${left} → ${rightShort}`;
            flowBar.style.opacity = '1';

            // Route execution (passing encrypt_steps as data.steps)
            const encryptPayload = { ...data, steps: data.encrypt_steps };
            setStepsText('Encryption steps', data.encrypt_steps);

            if (algo === 'caesar' && window.AnimCaesar) {
                await window.AnimCaesar.execute(inputText, encryptPayload, stepsOutput, charStrip);
            } else if (algo === 'vigenere' && window.AnimVigenere) {
                await window.AnimVigenere.execute(inputText, encryptPayload, stepsOutput, charStrip);
            } else if (algo === 'aes' && window.AnimAES) {
                await window.AnimAES.execute(inputText, encryptPayload, stepsOutput, charStrip);
            } else if (algo === 'rsa' && window.AnimRSA) {
                await window.AnimRSA.execute(inputText, encryptPayload, stepsOutput, charStrip);
            } else if (algo === 'sha256' && window.AnimSHA) {
                await window.AnimSHA.execute(inputText, encryptPayload, stepsOutput, charStrip);
            } else {
                await fallbackAnimation(inputText, encryptPayload, stepsOutput, charStrip);
            }

            cryptoStatus.innerText = "Encryption Complete. Output Ready.";
            cryptoStatus.style.color = "var(--success)";

            // Output Results
            encryptedOutput.value = data.encrypted || '';
            
            // Enable decrypt button if reversible
            if (decryptBtn) decryptBtn.disabled = (algo === 'sha256');

            schedulePersist();

        } catch (error) {
            stepsOutput.innerHTML = `<div class="transform-card" style="border-left-color: var(--error); display:block;"><span style="color:var(--error);"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${error.message}</span></div>`;
            cryptoStatus.innerText = "Encryption Failed!";
            cryptoStatus.style.color = "var(--error)";
        } finally {
            btnText.innerText = "Execute Encryption";
        }
    });

    // Decrypt Phase Action
    if (decryptBtn) {
        decryptBtn.addEventListener('click', async () => {
            if (!cacheData || cacheAlgo === 'sha256') return;
            
            decryptBtn.disabled = true;
            stepsOutput.innerHTML = '';
            charStrip.innerHTML = '';
            setStepsText('', []);
            
            cryptoStatus.innerText = "Running Decryption Flow...";
            cryptoStatus.style.color = "var(--accent)";
            
            flowBar.style.opacity = '0';
            await delay(300);
            const enc = (cacheData.encrypted || '').toString();
            const encShort = enc.length > 28 ? `${enc.slice(0, 28)}…` : enc;
            flowBar.innerText = `${encShort} → ${cacheData.decrypted}`;
            flowBar.style.opacity = '1';

            const decryptPayload = { ...cacheData, steps: cacheData.decrypt_steps, encrypted: cacheData.decrypted };
            setStepsText('Decryption steps', cacheData.decrypt_steps);

            // Start animation loop for decryption mapping
            if (cacheAlgo === 'caesar' && window.AnimCaesar) {
                await window.AnimCaesar.execute(cacheData.encrypted, decryptPayload, stepsOutput, charStrip);
            } else if (cacheAlgo === 'vigenere' && window.AnimVigenere) {
                await window.AnimVigenere.execute(cacheData.encrypted, decryptPayload, stepsOutput, charStrip);
            } else if (cacheAlgo === 'aes' && window.AnimAES) {
                await window.AnimAES.execute(cacheData.encrypted, decryptPayload, stepsOutput, charStrip);
            } else if (cacheAlgo === 'rsa' && window.AnimRSA) {
                await window.AnimRSA.execute(cacheData.encrypted, decryptPayload, stepsOutput, charStrip);
            } else {
                await fallbackAnimation(cacheData.encrypted, decryptPayload, stepsOutput, charStrip);
            }
            
            decryptedOutput.value = cacheData.decrypted || '';
            cryptoStatus.innerText = "Decryption Complete. Message Recovered.";
            cryptoStatus.style.color = "var(--success)";
            decryptBtn.disabled = false;
            schedulePersist();
        });
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

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
