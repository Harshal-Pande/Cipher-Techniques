window.AnimAES = {
    ensureVisuals: function() {
        const host = document.getElementById('aes-visuals');
        if (!host) return null;
        host.style.display = 'flex';
        host.innerHTML = `
            <div class="aes-lab">
                <div class="aes-top">
                    <div class="aes-hud">
                        <div class="aes-title mono"><i class="fa-solid fa-cubes"></i> AES-256 LAB (CBC)</div>
                        <div id="aes-phase" class="aes-phase mono">Ready…</div>
                    </div>
                    <div class="aes-out-box mono">
                        <div class="aes-out-k">CIPHERTEXT (Base64)</div>
                        <div id="aes-final-out" class="aes-out-v">—</div>
                    </div>
                </div>

                <div class="aes-pipeline mono" id="aes-pipeline">
                    <div class="aes-pstep" data-step="msg">1. MSG</div>
                    <div class="aes-psep">→</div>
                    <div class="aes-pstep" data-step="bytes">2. BYTES</div>
                    <div class="aes-psep">→</div>
                    <div class="aes-pstep" data-step="pad">3. PKCS7</div>
                    <div class="aes-psep">→</div>
                    <div class="aes-pstep" data-step="iv">4. IV</div>
                    <div class="aes-psep">→</div>
                    <div class="aes-pstep" data-step="rounds">5. ROUNDS</div>
                    <div class="aes-psep">→</div>
                    <div class="aes-pstep" data-step="out">6. OUT</div>
                </div>

                <div class="aes-bench-wrap">
                    <div class="aes-rail"></div>
                    <div id="aes-byte-bench" class="aes-byte-bench"></div>
                </div>

                <div class="aes-mid">
                    <div class="aes-grid-wrap">
                        <div class="aes-grid-label mono">State (2×2 preview)</div>
                        <div class="aes-grid" id="aes-grid"></div>
                    </div>
                    <div class="aes-readouts mono" id="aes-readouts">
                        <div class="aes-readout"><span class="aes-k">KEY (hex)</span> <span id="aes-key" class="aes-v">—</span></div>
                        <div class="aes-readout"><span class="aes-k">IV (hex)</span> <span id="aes-iv" class="aes-v">—</span></div>
                    </div>
                </div>
            </div>
        `;
        return host;
    },

    highlightPipeline: function(key) {
        document.querySelectorAll('.aes-pstep').forEach((el) => {
            el.classList.toggle('active', el.getAttribute('data-step') === key);
        });
    },

    buildByteBench: function(text) {
        const bench = document.getElementById('aes-byte-bench');
        if (!bench) return;
        bench.innerHTML = '';
        const t = (text || '').slice(0, 6);
        for (let i = 0; i < 6; i++) {
            const ch = i < t.length ? t[i] : ' ';
            const slot = document.createElement('div');
            slot.className = 'aes-byte-slot';
            const disp = ch === ' ' ? '\u00a0' : ch;
            const code = ch === ' ' ? '—' : ch.charCodeAt(0);
            slot.innerHTML = `
                <div class="aes-byte-note" id="aes-bnote-${i}"></div>
                <div class="aes-byte-vessel mono" id="aes-bv-${i}">${disp}</div>
                <div class="aes-byte-meta mono" id="aes-bmeta-${i}">ASCII ${ch === ' ' ? '—' : code}</div>
            `;
            bench.appendChild(slot);
        }
        const s = window.getAnimScale ? window.getAnimScale() : 1;
        if (window.gsap) {
            gsap.fromTo('.aes-byte-vessel', { y: 120, opacity: 0, scale: 0.85 }, {
                y: 0, opacity: 1, scale: 1, duration: 0.55 * s, stagger: 0.08 * s, ease: 'back.out(1.5)'
            });
        }
    },

    animateCharToByte: async function(slotIdx, ch) {
        if (!ch || ch === ' ') return;
        const vessel = document.getElementById(`aes-bv-${slotIdx}`);
        const note = document.getElementById(`aes-bnote-${slotIdx}`);
        const meta = document.getElementById(`aes-bmeta-${slotIdx}`);
        const ord = ch.charCodeAt(0);
        const hex = ord.toString(16).toUpperCase().padStart(2, '0');
        const s = window.getAnimScale ? window.getAnimScale() : 1;
        if (note) {
            note.innerText = `Letter "${ch}" → byte index ${ord}`;
            if (window.gsap) {
                gsap.fromTo(note, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25 * s });
                gsap.to(note, { opacity: 0, duration: 0.2 * s, delay: 0.9 * s });
            }
        }
        if (window.gsap && vessel) {
            const tl = gsap.timeline();
            tl.to(vessel, { borderColor: '#00f3ff', color: '#00f3ff', duration: 0.3 * s });
            tl.add(() => {
                vessel.innerText = `0x${hex}`;
                vessel.style.fontSize = '1.35rem';
            }, 0.2 * s);
            tl.to(vessel, { borderColor: '#f59e0b', color: '#f59e0b', duration: 0.35 * s }, 0.55 * s);
        } else if (vessel) {
            vessel.innerText = `0x${hex}`;
            vessel.style.fontSize = '1.35rem';
        }
        if (meta) meta.innerText = `UTF-8 byte 0x${hex}`;
        if (window.getBaseDelay) await window.animDelay();
    },

    buildGrid: function(blockText) {
        const grid = document.getElementById('aes-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const chars = blockText.padEnd(4, ' ').slice(0, 4).split('');
        for (let i = 0; i < 4; i++) {
            const cell = document.createElement('div');
            cell.className = 'aes-cell';
            cell.id = `aes-cell-${i}`;
            const c = chars[i] === ' ' ? '&nbsp;' : chars[i];
            cell.innerHTML = `
                <div class="aes-pop" id="aes-pop-${i}"></div>
                <div class="aes-stamp" id="aes-stamp-${i}">SBOX</div>
                <div class="aes-meta mono">B${i}</div>
                <div class="aes-val" id="aes-val-${i}">${c}</div>
            `;
            grid.appendChild(cell);
        }
    },

    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;

        this.ensureVisuals();
        if (charStrip) charStrip.innerHTML = '';

        const phaseEl = document.getElementById('aes-phase');
        const keyEl = document.getElementById('aes-key');
        const ivEl = document.getElementById('aes-iv');
        const finalOut = document.getElementById('aes-final-out');
        if (finalOut) finalOut.innerText = '—';

        const block = (input || '').toUpperCase().padEnd(4, ' ').slice(0, 4);
        this.buildGrid(block);
        this.buildByteBench(input || '');
        this.highlightPipeline('msg');
        if (phaseEl) phaseEl.innerText = 'Step 1: Load message → show each char as byte (hex)';

        const s = window.getAnimScale ? window.getAnimScale() : 1;
        if (window.gsap) {
            gsap.fromTo('.aes-cell', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35 * s, stagger: 0.06 * s, ease: 'back.out(1.7)' });
        }

        const plain = input || '';
        let bytesAnimated = false;

        for (let i = 0; i < steps.length; i++) {
            if (!steps[i]) continue;
            const line = steps[i].toString();

            if (/Plaintext bytes\s*:/i.test(line) && !bytesAnimated) {
                bytesAnimated = true;
                this.highlightPipeline('bytes');
                if (phaseEl) phaseEl.innerText = 'Step 2: Plaintext → UTF-8 bytes (per character)';
                for (let j = 0; j < Math.min(plain.length, 6); j++) {
                    await this.animateCharToByte(j, plain[j]);
                }
            }

            if (/Input Text/i.test(line)) {
                this.highlightPipeline('msg');
                if (phaseEl) phaseEl.innerText = 'Step 1: Message loaded';
            }

            const mKey = line.match(/Padded Key\s*:\s*([0-9a-fA-F]+)/);
            if (mKey && keyEl) {
                keyEl.innerText = `${mKey[1].slice(0, 16)}…`;
                if (window.gsap) gsap.fromTo(keyEl, { opacity: 0.5 }, { opacity: 1, duration: 0.3 * s });
            }

            if (/After PKCS7 pad/i.test(line)) {
                this.highlightPipeline('pad');
                if (phaseEl) phaseEl.innerText = 'Step 3: PKCS7 padding → length multiple of 16 bytes';
                const note0 = document.getElementById('aes-bnote-0');
                if (note0) {
                    note0.innerText = 'PKCS7: append bytes so total length ≡ 0 (mod 16)';
                    note0.style.opacity = '1';
                    if (window.gsap) gsap.to(note0, { opacity: 0, delay: 1.2 * s, duration: 0.25 * s });
                }
            }

            const mIv = line.match(/IV \(hex\)\s*:\s*([0-9a-fA-F]+)/);
            if (mIv && ivEl) {
                this.highlightPipeline('iv');
                if (phaseEl) phaseEl.innerText = 'Step 4: Random IV (16 bytes) for CBC uniqueness';
                ivEl.innerText = `${mIv[1].slice(0, 16)}…`;
                if (window.gsap) {
                    gsap.fromTo(ivEl, { scale: 0.95 }, { scale: 1.05, duration: 0.2 * s, yoyo: true, repeat: 1 });
                }
            }

            if (/Round Operations|SubBytes|ShiftRows|MixColumns|AddRoundKey/i.test(line)) {
                this.highlightPipeline('rounds');
                if (phaseEl) phaseEl.innerText = 'Step 5: AES rounds (SubBytes → ShiftRows → MixColumns → AddRoundKey) × 14 (AES-256)';
            }

            const isSub = /\[SubBytes\]/i.test(line);
            const isShift = /\[ShiftRows\]/i.test(line);
            const isMix = /\[MixColumns\]/i.test(line);
            const isAddKey = /\[AddRoundKey\]/i.test(line);

            if (window.gsap && (isSub || isShift || isMix || isAddKey)) {
                if (isSub) {
                    for (let j = 0; j < 4; j++) {
                        const pop = document.getElementById(`aes-pop-${j}`);
                        const stamp = document.getElementById(`aes-stamp-${j}`);
                        const val = document.getElementById(`aes-val-${j}`);
                        if (!pop || !stamp || !val) continue;
                        const rawChar = val.innerText === '' ? ' ' : val.innerText;
                        const hex = rawChar.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
                        gsap.set(pop, { opacity: 0, x: 0 });
                        pop.innerText = `S-Box in: 0x${hex}`;
                        gsap.to(pop, { opacity: 1, x: 18, duration: 0.18 * s });
                        gsap.fromTo(stamp, { opacity: 0, y: -36 }, { opacity: 1, y: 0, duration: 0.22 * s, ease: 'power2.out' });
                        gsap.to(val, { color: '#f59e0b', duration: 0.08 * s });
                        gsap.to(stamp, { opacity: 0, scale: 1.6, duration: 0.25 * s, delay: 0.04 * s });
                        gsap.to(pop, { opacity: 0, duration: 0.18 * s, delay: 0.22 * s });
                    }
                } else if (isShift) {
                    gsap.to('#aes-cell-2', { x: 36, duration: 0.32 * s, ease: 'back.inOut(1.2)' });
                    gsap.to('#aes-cell-3', { x: -36, duration: 0.32 * s, ease: 'back.inOut(1.2)' });
                    gsap.to(['#aes-cell-2', '#aes-cell-3'], { x: 0, duration: 0.01, delay: 0.34 * s });
                } else if (isMix) {
                    gsap.to('.aes-cell', { scale: 1.04, duration: 0.12 * s, yoyo: true, repeat: 2, stagger: 0.04 * s });
                } else if (isAddKey) {
                    gsap.to('.aes-cell', { boxShadow: '0 0 22px rgba(168, 85, 247, 0.35)', borderColor: 'rgba(168, 85, 247, 0.55)', duration: 0.22 * s });
                    gsap.to('.aes-cell', { boxShadow: 'none', duration: 0.22 * s, delay: 0.22 * s });
                }
            }

            if (/Final Output\s*:/i.test(line) || /Base64 Encoding/i.test(line) || /Raw Ciphertext/i.test(line)) {
                this.highlightPipeline('out');
                if (phaseEl) phaseEl.innerText = 'Step 6: IV + ciphertext → Base64 for transport';
                if (data.encrypted && finalOut) {
                    const short = data.encrypted.length > 48 ? data.encrypted.slice(0, 48) + '…' : data.encrypted;
                    finalOut.innerText = short;
                    if (window.gsap) gsap.fromTo(finalOut, { opacity: 0.3 }, { opacity: 1, duration: 0.4 * s });
                }
            }

            if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
        }

        this.highlightPipeline('out');
        if (phaseEl) phaseEl.innerText = 'Done: decrypt reverses rounds + removes PKCS7';

        const grid = document.getElementById('aes-grid');
        if (grid && data.encrypted) {
            const existing = document.querySelector('#aes-visuals .aes-chips');
            if (existing) existing.remove();
            const chips = document.createElement('div');
            chips.className = 'aes-chips mono';
            const raw = atobSafe(data.encrypted);
            const hexPreview = raw ? Array.from(raw.slice(0, 12)).map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')) : [];
            chips.innerHTML = hexPreview.slice(0, 8).map((b) => `<span class="aes-chip">${b}</span>`).join('') + (hexPreview.length > 8 ? `<span class="aes-chip aes-chip-ghost">…</span>` : '');
            const lab = grid.closest('.aes-lab') || grid.parentElement;
            if (lab) lab.appendChild(chips);
            if (window.gsap) gsap.fromTo('.aes-chip', { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22 * s, stagger: 0.04 * s });
        }
    }
};

function atobSafe(b64) {
    try {
        return atob(b64);
    } catch {
        return '';
    }
}
