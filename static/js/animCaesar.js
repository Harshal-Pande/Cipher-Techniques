window.AnimCaesar = {
    ensureVisuals: function(shift) {
        const host = document.getElementById('caesar-visuals');
        if (!host) return null;
        host.style.display = 'flex';
        host.innerHTML = `
            <div class="caesar-stage">
                <div class="caesar-top">
                    <div class="caesar-hud">
                        <div class="caesar-title mono"><i class="fa-solid fa-rotate"></i> CAESAR LAB</div>
                        <div class="caesar-phase mono" id="caesar-phase">Ready…</div>
                    </div>
                    <div class="caesar-key mono">N = <span id="caesar-key-n">${shift ?? '-'}</span></div>
                </div>

                <div class="caesar-bench-wrap">
                    <div class="caesar-rail"></div>
                    <div class="caesar-bench" id="caesar-bench"></div>
                </div>
            </div>
        `;
        return host;
    },

    MAX_SLOTS: 18,

    buildBench: function(text, shift) {
        const bench = document.getElementById('caesar-bench');
        if (!bench) return;
        bench.innerHTML = '';
        const raw = text || '';
        const n = Math.min(Math.max(raw.length, 1), this.MAX_SLOTS);
        bench.classList.toggle('caesar-bench-compact', n > 6);

        const letters = raw.slice(0, n).padEnd(n, ' ').split('');
        for (let i = 0; i < letters.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'caesar-slot';
            const disp = letters[i] === ' ' ? '&nbsp;' : letters[i];
            slot.innerHTML = `
                <div class="caesar-note" id="caesar-note-${i}"></div>
                <div class="caesar-vessel mono" id="caesar-vessel-${i}">${disp}</div>
                <div class="caesar-injector mono" id="caesar-injector-${i}">${shift >= 0 ? '+' : ''}${shift}</div>
            `;
            bench.appendChild(slot);
        }
        if (window.gsap) {
            const s = window.getAnimScale ? window.getAnimScale() : 1;
            gsap.fromTo(
                '.caesar-vessel',
                { y: 260, opacity: 0, scale: 0.7 },
                { y: 0, opacity: 1, scale: 1, duration: 0.7 * s, stagger: 0.1 * s, ease: 'back.out(1.7)' }
            );
        }
    },

    parseStep: function(step) {
        const line = (step || '').toString();
        const idxMatch = line.match(/^\[(\d+)\]\s*/);
        const charIndex = idxMatch ? parseInt(idxMatch[1], 10) - 1 : null;

        // Encryption: [1] 'H' → pos 7 + shift 3 = pos 10 → 'K'
        // Decryption: [1] 'K' → pos 10 - shift 3 = pos 7 → 'H'
        const mathMatch = line.match(/'(.+?)' → pos (\d+) ([+-]) shift (\d+) = pos (\d+) → '(.+?)'/);
        if (mathMatch) {
            return {
                type: 'math',
                charIndex,
                from: mathMatch[1],
                origPos: mathMatch[2],
                op: mathMatch[3],
                shift: mathMatch[4],
                newPos: mathMatch[5],
                to: mathMatch[6]
            };
        }

        const keepMatch = line.match(/^\[(\d+)\]\s*'(.+?)' → .*kept as-is/);
        if (keepMatch) {
            return {
                type: 'keep',
                charIndex: parseInt(keepMatch[1], 10) - 1,
                char: keepMatch[2]
            };
        }
        return null;
    },

    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;
        
        // Try to infer shift for the hero animation
        let inferredShift = null;
        for (const s of steps) {
            const m = s && s.match(/shift (\d+)/);
            if (m) { inferredShift = parseInt(m[1], 10); break; }
        }
        this.ensureVisuals(inferredShift);
        if (document.getElementById('caesar-key-n') && inferredShift !== null) {
            document.getElementById('caesar-key-n').innerText = inferredShift;
        }
        this.buildBench(input, inferredShift ?? 0);
        const slotCount = Math.min(Math.max((input || '').length, 1), this.MAX_SLOTS);

        if (charStrip) charStrip.innerHTML = '';

        const phaseEl = document.getElementById('caesar-phase');
        if (phaseEl) phaseEl.innerText = 'Step 1: Map letters to indices';

        for (let i = 0; i < steps.length; i++) {
            if (!steps[i]) continue;

            const parsed = this.parseStep(steps[i]);
            if (parsed && parsed.type === 'math') {
                const ci = parsed.charIndex != null ? parsed.charIndex : 0;
                if (ci >= slotCount) {
                    if (phaseEl) phaseEl.innerText = `Character ${ci + 1}+ (lab shows first ${slotCount} only)`;
                    if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
                    continue;
                }
                const idx = Math.min(Math.max(ci, 0), slotCount - 1);
                const vessel = document.getElementById(`caesar-vessel-${idx}`);
                const note = document.getElementById(`caesar-note-${idx}`);
                const inj = document.getElementById(`caesar-injector-${idx}`);
                if (phaseEl) {
                    phaseEl.innerText = `Char ${ci + 1}/${slotCount}: ${parsed.op === '+' ? 'Encrypt' : 'Decrypt'} (${parsed.from} → ${parsed.to})`;
                }

                const pace = (window.getAnimScale ? window.getAnimScale() : 1) * 1.45;

                if (window.gsap && vessel && inj) {
                    await new Promise((resolve) => {
                        const tl = gsap.timeline({ onComplete: resolve });
                        if (note) {
                            note.innerText = `pos ${parsed.origPos} ${parsed.op} ${parsed.shift} → ${parsed.newPos}`;
                            tl.fromTo(note, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 * pace });
                            tl.to(note, { opacity: 0, duration: 0.28 * pace }, 1.15 * pace);
                        }
                        tl.to(inj, { opacity: 1, top: '20px', duration: 0.65 * pace, ease: 'bounce.out' }, 0.05 * pace);
                        tl.to(inj, { top: '180px', opacity: 0, duration: 0.45 * pace, ease: 'power2.in' }, 0.35 * pace);
                        tl.to(vessel, { borderColor: '#00f3ff', color: '#00f3ff', duration: 0.38 * pace }, 0.08 * pace);
                        tl.to(vessel, { backgroundColor: 'rgba(188, 19, 254, 0.35)', color: '#fff', duration: 0.28 * pace }, 0.5 * pace);
                        tl.add(() => {
                            vessel.innerText = parsed.to;
                        }, 0.52 * pace);
                        tl.to(vessel, {
                            backgroundColor: 'transparent',
                            borderColor: '#39ff14',
                            color: '#39ff14',
                            boxShadow: '0 0 40px rgba(57, 255, 20, 0.25)',
                            duration: 0.6 * pace,
                            ease: 'power4.out'
                        }, 0.78 * pace);
                    });
                } else if (vessel) {
                    vessel.innerText = parsed.to;
                }
            } else if (parsed && parsed.type === 'keep') {
                const ci = parsed.charIndex != null ? parsed.charIndex : 0;
                if (ci >= slotCount) {
                    if (phaseEl) phaseEl.innerText = `Character ${ci + 1}+ (lab shows first ${slotCount} only)`;
                    if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
                    continue;
                }
                const idx = Math.min(Math.max(ci, 0), slotCount - 1);
                const vessel = document.getElementById(`caesar-vessel-${idx}`);
                if (phaseEl) phaseEl.innerText = `Char ${ci + 1}/${slotCount}: skip (kept as-is)`;
                if (window.gsap && vessel) {
                    const pace = (window.getAnimScale ? window.getAnimScale() : 1) * 1.45;
                    await new Promise((resolve) => {
                        gsap.timeline({ onComplete: resolve })
                            .to(vessel, { borderColor: '#94a3b8', duration: 0.25 * pace })
                            .to(vessel, { borderColor: 'rgba(255,255,255,0.10)', duration: 0.35 * pace }, 0.4 * pace);
                    });
                }
            }

            if (window.getBaseDelay && window.getBaseDelay() > 0) {
                await window.animDelay();
            }
        }
    }
};
