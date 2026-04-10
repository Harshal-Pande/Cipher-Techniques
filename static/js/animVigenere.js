window.AnimVigenere = {
    MAX_SLOTS: 18,

    ensureVisuals: function() {
        const host = document.getElementById('vigenere-visuals');
        if (!host) return null;
        host.style.display = 'flex';
        host.innerHTML = `
            <div class="vig-stage">
                <div class="vig-top">
                    <div class="vig-hud">
                        <div class="vig-title mono"><i class="fa-solid fa-table-cells"></i> VIGENÈRE LAB</div>
                        <div class="vig-phase mono" id="vig-phase">Ready…</div>
                    </div>
                    <div class="vig-out mono">
                        <div class="vig-out-k">OUTPUT</div>
                        <div id="vig-output" class="vig-out-v">—</div>
                    </div>
                </div>

                <div class="vig-bench-wrap">
                    <div class="vig-rail"></div>
                    <div id="vig-bench" class="vig-bench"></div>
                </div>
            </div>
        `;
        return host;
    },

    buildBench: function(text, key) {
        const bench = document.getElementById('vig-bench');
        if (!bench) return;
        bench.innerHTML = '';

        const raw = text || '';
        const n = Math.min(Math.max(raw.length, 1), this.MAX_SLOTS);
        bench.classList.toggle('vig-bench-compact', n > 6);

        const k = (key || '').toUpperCase();
        const kl = k.length;
        let ki = 0;
        const slice = raw.slice(0, n).padEnd(n, ' ');

        const keyLetters = [];
        for (let i = 0; i < n; i++) {
            const ch = slice[i];
            if (ch !== ' ' && /[a-z]/i.test(ch) && kl) {
                keyLetters.push(k[ki % kl]);
                ki++;
            } else {
                keyLetters.push(null);
            }
        }

        for (let i = 0; i < n; i++) {
            const ch = slice[i];
            const disp = ch === ' ' ? '&nbsp;' : ch;
            const kr = keyLetters[i];
            const injLabel = kr == null ? '—' : `+${kr.charCodeAt(0) - 65}`;

            const slot = document.createElement('div');
            slot.className = 'vig-slot';
            slot.innerHTML = `
                <div class="vig-note" id="vig-note-${i}"></div>
                <div class="vig-vessel mono" id="vig-vessel-${i}">${disp}</div>
                <div class="vig-keychip mono" id="vig-key-${i}">${kr == null ? '—' : kr}</div>
                <div class="vig-injector mono" id="vig-inj-${i}">${injLabel}</div>
                <div class="vig-math mono" id="vig-math-${i}">—</div>
            `;
            bench.appendChild(slot);
        }

        if (window.gsap) {
            const s = window.getAnimScale ? window.getAnimScale() : 1;
            gsap.fromTo('.vig-vessel', { y: 220, opacity: 0, scale: 0.75 }, {
                y: 0, opacity: 1, scale: 1, duration: 0.75 * s, stagger: 0.1 * s, ease: 'power3.out'
            });
            gsap.fromTo('.vig-keychip', { y: -14, opacity: 0, scale: 0.92 }, {
                y: 0, opacity: 1, scale: 1, duration: 0.45 * s, stagger: 0.05 * s, ease: 'power2.out', delay: 0.08 * s
            });
        }
    },

    parseStep: function(step) {
        const line = (step || '').toString().trimEnd();

        const decMatch = line.match(/\[\s*(\d+)\s*\]\s*'(.+?)'\s*-\s*key\s*'(.+?)'\((\d+)\)\s*→\s*pos\s*(\d+)\s*→\s*'(.+?)'/);
        if (decMatch) {
            return {
                type: 'math',
                charIndex: parseInt(decMatch[1], 10) - 1,
                op: '-',
                from: decMatch[2],
                key: decMatch[3],
                kval: parseInt(decMatch[4], 10),
                newPos: parseInt(decMatch[5], 10),
                to: decMatch[6]
            };
        }

        const keepDec = line.match(/\[\s*(\d+)\s*\]\s*'(.+?)'\s*→\s*.*kept as-is/);
        if (keepDec) {
            return {
                type: 'keep',
                charIndex: parseInt(keepDec[1], 10) - 1,
                char: keepDec[2]
            };
        }

        const encMatch = line.match(/\[\s*(\d+)\s*\]\s+(\S)\s+(\S)\s+(\d+)\s+(\S)\s*$/);
        if (encMatch && encMatch[3] !== '—') {
            return {
                type: 'math',
                charIndex: parseInt(encMatch[1], 10) - 1,
                op: '+',
                from: encMatch[2],
                key: encMatch[3],
                kval: parseInt(encMatch[4], 10),
                to: encMatch[5]
            };
        }

        const encDash = line.match(/\[\s*(\d+)\s*\]\s+(\S)\s+—\s+—\s+(\S)\s*$/);
        if (encDash) {
            return {
                type: 'keep',
                charIndex: parseInt(encDash[1], 10) - 1,
                char: encDash[3]
            };
        }

        return null;
    },

    runMathTimeline: function(parsed, vessel, note, inj, math, keychip, pIdx, resIdx, pace) {
        return new Promise((resolve) => {
            if (!vessel) {
                resolve();
                return;
            }
            if (!window.gsap) {
                vessel.innerText = parsed.to;
                vessel.style.fontSize = '';
                resolve();
                return;
            }

            const tl = gsap.timeline({
                onComplete: resolve,
                defaults: { ease: 'power2.out' }
            });

            if (note) {
                note.innerText = `${parsed.from}(${pIdx}) ${parsed.op} ${parsed.key}(${parsed.kval}) → ${resIdx}`;
                tl.fromTo(note, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 * pace }, 0);
                tl.to(note, { opacity: 0, duration: 0.32 * pace, ease: 'power2.in' }, 1.45 * pace);
            }

            if (math) {
                math.innerText = `${pIdx} ${parsed.op} ${parsed.kval} ≡ ${resIdx} (mod 26)`;
                tl.fromTo(math, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.38 * pace }, 0.1 * pace);
                tl.to(math, { opacity: 0, duration: 0.3 * pace, ease: 'power2.in' }, 1.48 * pace);
            }

            if (keychip) {
                tl.fromTo(keychip, { scale: 1, boxShadow: '0 0 0 rgba(168,85,247,0)' }, {
                    scale: 1.08,
                    boxShadow: '0 0 18px rgba(168, 85, 247, 0.45)',
                    duration: 0.28 * pace
                }, 0.12 * pace);
                tl.to(keychip, { scale: 1, boxShadow: '0 0 0 rgba(168,85,247,0)', duration: 0.4 * pace, ease: 'power3.out' }, 0.45 * pace);
            }

            tl.to(vessel, {
                borderColor: '#22d3ee',
                color: '#67e8f9',
                scale: 1.04,
                duration: 0.42 * pace
            }, 0.02 * pace);

            tl.add(() => {
                vessel.innerText = String(pIdx);
                vessel.style.fontSize = '1.75rem';
            }, 0.38 * pace);

            tl.to(vessel, { scale: 1, duration: 0.3 * pace, ease: 'power2.inOut' }, 0.4 * pace);

            if (inj) {
                tl.to(inj, { opacity: 1, top: '22px', duration: 0.72 * pace, ease: 'bounce.out' }, 0.48 * pace);
                tl.to(inj, { top: '180px', opacity: 0, duration: 0.52 * pace, ease: 'power3.in' }, 0.58 * pace);
            }

            tl.to(vessel, {
                backgroundColor: 'rgba(168, 85, 247, 0.28)',
                color: '#f5f3ff',
                duration: 0.32 * pace
            }, 0.95 * pace);

            tl.add(() => {
                vessel.innerText = String(resIdx);
            }, 1.02 * pace);

            tl.to(vessel, {
                backgroundColor: 'transparent',
                borderColor: '#4ade80',
                color: '#86efac',
                boxShadow: '0 0 36px rgba(74, 222, 128, 0.35)',
                duration: 0.68 * pace,
                ease: 'power3.out'
            }, 1.2 * pace);

            tl.add(() => {
                vessel.innerText = parsed.to;
                vessel.style.fontSize = '';
            }, 1.32 * pace);

            tl.to(vessel, {
                boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
                duration: 0.35 * pace,
                ease: 'power2.out'
            }, 1.55 * pace);
        });
    },

    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;

        this.ensureVisuals();
        if (charStrip) charStrip.innerHTML = '';

        let inferredKey = '';
        for (const s of steps) {
            const m = s && s.match(/🔑 Key\s*:\s*'(.+?)'/);
            if (m) {
                inferredKey = m[1];
                break;
            }
        }
        if (!inferredKey) {
            for (const s of steps) {
                const m2 = s && s.match(/key\s+'(.+?)'\(/i);
                if (m2) {
                    inferredKey = m2[1];
                    break;
                }
            }
        }

        this.buildBench(input, inferredKey);
        const slotCount = Math.min(Math.max((input || '').length, 1), this.MAX_SLOTS);

        const outEl = document.getElementById('vig-output');
        if (outEl) outEl.innerText = '';

        let outSoFar = '';
        const paceBase = (window.getAnimScale ? window.getAnimScale() : 1) * 1.55;

        for (let i = 0; i < steps.length; i++) {
            if (!steps[i]) continue;

            const parsed = this.parseStep(steps[i]);
            const phase = document.getElementById('vig-phase');

            if (parsed && parsed.type === 'math') {
                const ci = parsed.charIndex != null ? parsed.charIndex : outSoFar.length;
                if (ci >= slotCount) {
                    if (phase) phase.innerText = `Character ${ci + 1}+ (lab shows first ${slotCount} only)`;
                    outSoFar += parsed.to;
                    if (outEl) outEl.innerText = outSoFar;
                    if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
                    continue;
                }

                const slotIdx = ci;
                const vessel = document.getElementById(`vig-vessel-${slotIdx}`);
                const note = document.getElementById(`vig-note-${slotIdx}`);
                const inj = document.getElementById(`vig-inj-${slotIdx}`);
                const math = document.getElementById(`vig-math-${slotIdx}`);
                const keychip = document.getElementById(`vig-key-${slotIdx}`);

                if (!vessel) {
                    outSoFar += parsed.to;
                    if (outEl) outEl.innerText = outSoFar;
                    if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
                    continue;
                }

                if (inj) inj.innerText = `${parsed.op}${parsed.kval}`;

                const pIdx = parsed.from.toUpperCase().charCodeAt(0) - 65;
                const resIdx = parsed.op === '+'
                    ? (pIdx + parsed.kval) % 26
                    : (pIdx - parsed.kval + 26) % 26;

                if (phase) {
                    phase.innerText = `Char ${ci + 1}/${slotCount}: index → ${parsed.op === '+' ? 'add' : 'subtract'} key → letter`;
                }

                await this.runMathTimeline(parsed, vessel, note, inj, math, keychip, pIdx, resIdx, paceBase);

                outSoFar += parsed.to;
                if (outEl) outEl.innerText = outSoFar;

                if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
            } else if (parsed && parsed.type === 'keep') {
                const ci = parsed.charIndex != null ? parsed.charIndex : outSoFar.length;
                if (ci >= slotCount) {
                    if (phase) phase.innerText = `Character ${ci + 1}+ (lab shows first ${slotCount} only)`;
                    outSoFar += parsed.char;
                    if (outEl) outEl.innerText = outSoFar;
                    if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
                    continue;
                }

                const vessel = document.getElementById(`vig-vessel-${ci}`);
                if (phase) phase.innerText = `Char ${ci + 1}/${slotCount}: non-letter (unchanged)`;

                if (window.gsap && vessel) {
                    await new Promise((resolve) => {
                        gsap.timeline({ onComplete: resolve })
                            .to(vessel, { borderColor: '#94a3b8', color: '#cbd5e1', scale: 1.03, duration: 0.35 * paceBase, ease: 'power2.out' })
                            .to(vessel, { borderColor: 'rgba(255,255,255,0.10)', color: 'inherit', scale: 1, duration: 0.45 * paceBase, ease: 'power2.inOut' }, 0.25 * paceBase);
                    });
                }

                outSoFar += parsed.char;
                if (outEl) outEl.innerText = outSoFar;

                if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
            }
        }
    }
};
