window.AnimRSA = {
    ensureVisuals: function() {
        const host = document.getElementById('rsa-visuals');
        if (!host) return null;
        host.style.display = 'flex';
        host.innerHTML = `
            <div class="rsa-lab">
                <div class="rsa-top">
                    <div class="rsa-hud">
                        <div class="rsa-title mono"><i class="fa-solid fa-key"></i> RSA-2048 LAB</div>
                        <div class="rsa-phase mono" id="rsa-phase">Ready…</div>
                    </div>
                    <div class="rsa-out-box mono">
                        <div class="rsa-out-k" id="rsa-out-label">CIPHERTEXT (Base64)</div>
                        <div id="rsa-b64-out" class="rsa-out-v">—</div>
                    </div>
                </div>

                <div class="rsa-section-label mono">Encryption path</div>
                <div class="rsa-enc-pipeline mono" id="rsa-enc-pipeline">
                    <div class="rsa-epstep" data-enc="msg">MSG</div>
                    <span class="rsa-epsep">→</span>
                    <div class="rsa-epstep" data-enc="oaep">OAEP</div>
                    <span class="rsa-epsep">→</span>
                    <div class="rsa-epstep" data-enc="pow">M^e mod n</div>
                    <span class="rsa-epsep">→</span>
                    <div class="rsa-epstep" data-enc="b64">Base64</div>
                </div>

                <div class="rsa-msg-wrap">
                    <div class="rsa-rail"></div>
                    <div id="rsa-msg-bench" class="rsa-msg-bench"></div>
                </div>
                <div id="rsa-formula-note" class="rsa-formula-note mono" aria-hidden="true"></div>

                <div class="rsa-section-label mono">Key material</div>
                <div class="rsa-flow mono">
                    <div class="rsa-box" id="rsa-box-p">p</div>
                    <div class="rsa-arrow">→</div>
                    <div class="rsa-box" id="rsa-box-q">q</div>
                    <div class="rsa-arrow">→</div>
                    <div class="rsa-box rsa-box-wide" id="rsa-box-n">n = p×q</div>
                    <div class="rsa-arrow">→</div>
                    <div class="rsa-box rsa-box-wide" id="rsa-box-keys">(e, d)</div>
                </div>
            </div>
        `;
        return host;
    },

    highlightEnc: function(key) {
        document.querySelectorAll('.rsa-epstep').forEach((el) => {
            el.classList.toggle('active', el.getAttribute('data-enc') === key);
        });
    },

    buildMsgBench: function(text, isCipherBench) {
        const bench = document.getElementById('rsa-msg-bench');
        const label = document.getElementById('rsa-out-label');
        if (!bench) return;
        bench.innerHTML = '';
        if (label) label.innerText = isCipherBench ? 'INPUT (Base64 blocks)' : 'PLAINTEXT (chars)';
        const t = (text || '').slice(0, 8);
        const slots = 8;
        for (let i = 0; i < slots; i++) {
            const ch = i < t.length ? t[i] : '';
            const slot = document.createElement('div');
            slot.className = 'rsa-msg-slot';
            const disp = ch === '' ? '\u00a0' : ch;
            slot.innerHTML = `
                <div class="rsa-msg-meta mono" id="rsa-mmeta-${i}">${isCipherBench ? 'sym' : 'char'}</div>
                <div class="rsa-msg-vessel mono" id="rsa-mv-${i}">${disp}</div>
            `;
            bench.appendChild(slot);
        }
        const s = window.getAnimScale ? window.getAnimScale() : 1;
        if (window.gsap) {
            gsap.fromTo('.rsa-msg-vessel', { y: 70, opacity: 0, scale: 0.9 }, {
                y: 0, opacity: 1, scale: 1, duration: 0.45 * s, stagger: 0.06 * s, ease: 'back.out(1.4)'
            });
        }
    },

    pulseFormula: function(text) {
        const el = document.getElementById('rsa-formula-note');
        if (!el) return;
        el.innerText = text;
        el.setAttribute('aria-hidden', 'false');
        const s = window.getAnimScale ? window.getAnimScale() : 1;
        if (window.gsap) {
            gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28 * s });
            gsap.to(el, { opacity: 0, y: -4, duration: 0.25 * s, delay: 1.4 * s });
        } else {
            el.style.opacity = '1';
        }
    },

    revealB64: async function(b64) {
        const out = document.getElementById('rsa-b64-out');
        if (!out || !b64) return;
        out.innerText = '';
        const maxSteps = 22;
        const chunk = Math.max(6, Math.ceil(b64.length / maxSteps));
        const s = window.getAnimScale ? window.getAnimScale() : 1;
        for (let i = 0; i < b64.length; i += chunk) {
            out.innerText += b64.slice(i, i + chunk);
            if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
        }
        if (window.gsap) gsap.fromTo(out, { opacity: 0.5 }, { opacity: 1, duration: 0.25 * s });
    },

    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;

        this.ensureVisuals();
        if (charStrip) charStrip.innerHTML = '';

        const phase = document.getElementById('rsa-phase');
        const boxP = document.getElementById('rsa-box-p');
        const boxQ = document.getElementById('rsa-box-q');
        const boxN = document.getElementById('rsa-box-n');
        const boxKeys = document.getElementById('rsa-box-keys');
        const b64Out = document.getElementById('rsa-b64-out');

        const looksLikeB64 = (t) => t && t.length > 20 && /^[A-Za-z0-9+/=\s]+$/.test(t.trim());
        const decryptFlow = looksLikeB64(input);

        this.buildMsgBench(input || '', decryptFlow);
        this.highlightEnc(decryptFlow ? 'b64' : 'msg');
        if (b64Out) b64Out.innerText = decryptFlow ? '—' : '—';
        if (phase) phase.innerText = decryptFlow ? 'Decrypt: Base64 → integer → M = C^d mod n' : 'Encrypt: keys → OAEP → C = M^e mod n → Base64';

        const setBox = (el, text, accent) => {
            if (!el) return;
            el.innerText = text;
            if (window.gsap) {
                gsap.to(el, { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1 });
                if (accent) gsap.to(el, { boxShadow: accent, duration: 0.12, yoyo: true, repeat: 1 });
            }
        };

        let seenP = false;
        let seenQ = false;
        let seenE = false;
        let seenN = false;
        let seenD = false;
        let eVal = '65537';
        let ciphertextB64 = '';

        const s = window.getAnimScale ? window.getAnimScale() : 1;

        for (let i = 0; i < steps.length; i++) {
            if (!steps[i]) continue;

            const line = steps[i].toString();
            const me = line.match(/Public Exponent\s*\(e\)\s*:\s*(\d+)/i);
            const mp = line.match(/Prime p\s*:\s*(\d+)/i);
            const mq = line.match(/Prime q\s*:\s*(\d+)/i);
            const mn = line.match(/Modulus n\s*:\s*(\d+)/i);
            const md = line.match(/Private Exponent d\s*:\s*(\d+)/i);
            const cipherFull = line.match(/Ciphertext\s*\(Base64\)\s*:\s*([A-Za-z0-9+/=]+)/i);

            if (/Input Text/i.test(line)) {
                this.highlightEnc('msg');
                if (phase && !decryptFlow) phase.innerText = 'Message enters UTF-8 → encoded as integer block M < n';
            }

            if (/STEP 1/i.test(line) && /Key Generation/i.test(line) && phase && !decryptFlow) {
                phase.innerText = 'Step 1: generate primes p, q and modulus n';
            }

            if (me) {
                seenE = true;
                eVal = me[1];
                if (phase) phase.innerText = 'Keygen: public exponent e chosen (gcd with φ(n) = 1)';
                setBox(boxKeys, `(e=${eVal}, d=…)`, '0 0 22px rgba(16, 185, 129, 0.20)');
            }

            if (mp) {
                seenP = true;
                if (phase) phase.innerText = 'Keygen: prime p';
                setBox(boxP, `p = ${mp[1].slice(0, 10)}…`, '0 0 22px rgba(217, 70, 239, 0.25)');
            }
            if (mq) {
                seenQ = true;
                if (phase) phase.innerText = 'Keygen: prime q';
                setBox(boxQ, `q = ${mq[1].slice(0, 10)}…`, '0 0 22px rgba(217, 70, 239, 0.25)');
            }
            if (mn) {
                seenN = true;
                if (phase) phase.innerText = 'Keygen: n = p × q (public modulus)';
                setBox(boxN, `n = ${mn[1].slice(0, 10)}…`, '0 0 22px rgba(236, 72, 153, 0.22)');
            }
            if (md) {
                seenD = true;
                if (phase) phase.innerText = 'Keygen: d = e⁻¹ mod φ(n) (keep secret)';
                setBox(boxKeys, `(e=${eVal}, d=${md[1].slice(0, 10)}…)`, '0 0 22px rgba(16, 185, 129, 0.20)');
            }

            if (/OAEP/i.test(line) && /Padding/i.test(line)) {
                this.highlightEnc('oaep');
                if (phase && !decryptFlow) phase.innerText = 'OAEP-SHA256: randomizes & pads M before exponentiation';
                if (phase && decryptFlow && /stripped/i.test(line)) phase.innerText = 'OAEP padding removed → raw message bytes';
                this.pulseFormula(decryptFlow ? 'Strip OAEP → message bytes' : 'M_padded = OAEP_encode(message, n)');
            }

            if (/Formula:\s*C\s*=\s*M/i.test(line) || /C = M\^e mod n/i.test(line)) {
                this.highlightEnc('pow');
                if (!decryptFlow) this.pulseFormula(`C = M^${eVal} mod n`);
            }

            if (/Formula:\s*M\s*=\s*C/i.test(line) || /M = C\^d mod n/i.test(line)) {
                this.highlightEnc('pow');
                if (decryptFlow) this.pulseFormula('M = C^d mod n  →  strip OAEP → UTF-8');
            }

            if (cipherFull) {
                ciphertextB64 = cipherFull[1];
                this.highlightEnc('b64');
                if (phase) phase.innerText = 'Ciphertext encoded as Base64 for transport';
                await this.revealB64(ciphertextB64);
                setBox(boxKeys, 'OK ✓', '0 0 22px rgba(16, 185, 129, 0.25)');
                if (window.gsap) {
                    gsap.fromTo('.rsa-msg-vessel', { borderColor: 'rgba(255,255,255,0.12)' }, {
                        borderColor: 'rgba(16, 185, 129, 0.55)', duration: 0.2 * s, yoyo: true, repeat: 1, stagger: 0.03 * s
                    });
                }
            }

            if (/RSA Decryption/i.test(line) && phase) {
                phase.innerText = 'Decrypt: decode Base64 → C^d mod n → OAEP → plaintext';
            }

            if (/Decrypted Output/i.test(line)) {
                this.highlightEnc('msg');
                const lab = document.getElementById('rsa-out-label');
                if (lab) lab.innerText = 'DECRYPTED PLAINTEXT';
                const q1 = line.indexOf("'");
                const q2 = line.lastIndexOf("'");
                const dec = q1 >= 0 && q2 > q1 ? line.slice(q1 + 1, q2) : '';
                if (dec && b64Out) {
                    b64Out.innerText = dec.length > 140 ? dec.slice(0, 140) + '…' : dec;
                    if (window.gsap) gsap.fromTo(b64Out, { opacity: 0.4 }, { opacity: 1, duration: 0.35 * s });
                }
            }

            if (window.getBaseDelay && window.getBaseDelay() > 0) {
                await window.animDelay();
            }
        }

        if (!seenP && boxP) setBox(boxP, 'p', '0 0 18px rgba(217, 70, 239, 0.14)');
        if (!seenQ && boxQ) setBox(boxQ, 'q', '0 0 18px rgba(217, 70, 239, 0.14)');
        if (!seenE && boxKeys) setBox(boxKeys, '(e=65537, d=…)', '0 0 18px rgba(16, 185, 129, 0.14)');
        if (!seenN && boxN) setBox(boxN, 'n = p×q', '0 0 18px rgba(236, 72, 153, 0.14)');

        if (!decryptFlow && data.encrypted && b64Out && (!ciphertextB64 || b64Out.innerText === '—')) {
            await this.revealB64(data.encrypted);
            this.highlightEnc('b64');
        }
    }
};
