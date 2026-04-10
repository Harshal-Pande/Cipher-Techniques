window.AnimSHA = {
    ensureVisuals: function() {
        const host = document.getElementById('sha256-visuals');
        if (!host) return null;
        host.style.display = 'flex';
        host.innerHTML = `
            <div class="sha-lab">
                <div class="sha-top">
                    <div class="sha-hud">
                        <div class="sha-title mono"><i class="fa-solid fa-hashtag"></i> SHA-256 LAB</div>
                        <div class="sha-phase mono" id="sha-phase">Ready…</div>
                    </div>
                    <div class="sha-out-box mono">
                        <div class="sha-out-k">DIGEST (hex)</div>
                        <div id="sha-out" class="sha-out-v">—</div>
                    </div>
                </div>

                <div class="sha-pipeline mono" id="sha-pipeline">
                    <div class="sha-pstep" data-step="msg">MSG</div>
                    <span class="sha-psep">→</span>
                    <div class="sha-pstep" data-step="bytes">UTF-8</div>
                    <span class="sha-psep">→</span>
                    <div class="sha-pstep" data-step="compress">COMPRESS</div>
                    <span class="sha-psep">→</span>
                    <div class="sha-pstep" data-step="digest">DIGEST</div>
                    <span class="sha-psep">→</span>
                    <div class="sha-pstep" data-step="avalanche">AVALANCHE</div>
                </div>

                <div class="sha-bench-wrap">
                    <div class="sha-rail"></div>
                    <div id="sha-byte-bench" class="sha-byte-bench"></div>
                </div>

                <div class="sha-digests">
                    <div class="sha-digest-card">
                        <div class="sha-digest-head mono">
                            <span class="sha-digest-title">Original digest</span>
                            <span id="sha-diff-meta" class="sha-digest-meta"></span>
                        </div>
                        <div id="sha-digest-1" class="sha-digest mono"></div>
                    </div>
                    <div class="sha-digest-card">
                        <div class="sha-digest-head mono">
                            <span class="sha-digest-title">Modified digest</span>
                            <span id="sha-mod-label" class="sha-digest-meta"></span>
                        </div>
                        <div id="sha-digest-2" class="sha-digest mono"></div>
                    </div>
                </div>
            </div>
        `;
        return host;
    },

    highlight: function(key) {
        document.querySelectorAll('.sha-pstep').forEach((el) => {
            el.classList.toggle('active', el.getAttribute('data-step') === key);
        });
    },

    buildByteBench: function(text) {
        const bench = document.getElementById('sha-byte-bench');
        if (!bench) return;
        bench.innerHTML = '';
        const t = (text || '').slice(0, 8);
        for (let i = 0; i < 8; i++) {
            const ch = i < t.length ? t[i] : ' ';
            const slot = document.createElement('div');
            slot.className = 'sha-byte-slot';
            const disp = ch === ' ' ? '\u00a0' : ch;
            const code = ch === ' ' ? '—' : ch.charCodeAt(0);
            slot.innerHTML = `
                <div class="sha-byte-note" id="sha-bnote-${i}"></div>
                <div class="sha-byte-vessel mono" id="sha-bv-${i}">${disp}</div>
                <div class="sha-byte-meta mono" id="sha-bmeta-${i}">ASCII ${ch === ' ' ? '—' : code}</div>
            `;
            bench.appendChild(slot);
        }
        const s = window.getAnimScale ? window.getAnimScale() : 1;
        if (window.gsap) {
            gsap.fromTo('.sha-byte-vessel', { y: 90, opacity: 0, scale: 0.9 }, {
                y: 0, opacity: 1, scale: 1, duration: 0.55 * s, stagger: 0.05 * s, ease: 'back.out(1.4)'
            });
        }
    },

    animateCharToByte: async function(slotIdx, ch) {
        if (!ch || ch === ' ') return;
        const vessel = document.getElementById(`sha-bv-${slotIdx}`);
        const note = document.getElementById(`sha-bnote-${slotIdx}`);
        const meta = document.getElementById(`sha-bmeta-${slotIdx}`);
        const ord = ch.charCodeAt(0);
        const hex = ord.toString(16).toUpperCase().padStart(2, '0');
        const s = window.getAnimScale ? window.getAnimScale() : 1;

        if (note) {
            note.innerText = `"${ch}" → 0x${hex}`;
            if (window.gsap) {
                gsap.fromTo(note, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.22 * s });
                gsap.to(note, { opacity: 0, duration: 0.2 * s, delay: 0.85 * s });
            }
        }
        if (meta) meta.innerText = `UTF-8 byte 0x${hex}`;
        if (vessel && window.gsap) {
            const tl = gsap.timeline();
            tl.to(vessel, { borderColor: '#22d3ee', color: '#67e8f9', duration: 0.26 * s });
            tl.add(() => {
                vessel.innerText = `0x${hex}`;
                vessel.style.fontSize = '1.1rem';
            }, 0.18 * s);
            tl.to(vessel, { borderColor: 'rgba(20, 184, 166, 0.55)', color: '#99f6e4', duration: 0.3 * s }, 0.55 * s);
        } else if (vessel) {
            vessel.innerText = `0x${hex}`;
            vessel.style.fontSize = '1.1rem';
        }

        if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
    },

    renderDigestChips: function(el, hex, opts) {
        if (!el) return;
        const clean = (hex || '').replace(/[^0-9a-fA-F]/g, '').toLowerCase();
        const groups = clean.match(/.{1,4}/g) || [];
        const max = (opts && opts.maxGroups) || 16;
        const shown = groups.slice(0, max);
        el.innerHTML = shown.map((c, i) => `<span class="sha-chip" data-idx="${i}">${c}</span>`).join('') +
            (groups.length > max ? `<span class="sha-chip sha-chip-ghost">…</span>` : '');
    },

    animateDigestBuild: async function(el) {
        if (!el || !window.gsap) return;
        const s = window.getAnimScale ? window.getAnimScale() : 1;
        const chips = el.querySelectorAll('.sha-chip:not(.sha-chip-ghost)');
        gsap.fromTo(chips, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22 * s, stagger: 0.02 * s, ease: 'power2.out' });
        // small pause so it feels deliberate
        if (window.getBaseDelay && window.getBaseDelay() > 0) await window.animDelay();
    },

    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;

        this.ensureVisuals();
        if (charStrip) charStrip.innerHTML = '';

        const phase = document.getElementById('sha-phase');
        const outEl = document.getElementById('sha-out');
        const d1 = document.getElementById('sha-digest-1');
        const d2 = document.getElementById('sha-digest-2');
        const diffMeta = document.getElementById('sha-diff-meta');
        const modLabel = document.getElementById('sha-mod-label');

        this.highlight('msg');
        if (phase) phase.innerText = 'Step 1: read message';
        this.buildByteBench(input || '');

        let diff = null;
        let originalHash = (data.encrypted || '').toString();
        let modifiedInput = '';
        let modifiedHash = '';

        for (let i = 0; i < steps.length; i++) {
            const s = steps[i] && steps[i].toString();
            if (!s) continue;

            const m = s.match(/Hex difference:\s*~(\d+)/i);
            if (m) { diff = parseInt(m[1], 10); break; }
        }

        for (let i = 0; i < steps.length; i++) {
            const line = steps[i] && steps[i].toString();
            if (!line) continue;

            if (/Input Text/i.test(line)) {
                this.highlight('msg');
                if (phase) phase.innerText = 'Step 1: message loaded';
            }

            if (/SHA-256 generates/i.test(line) || /one-way function/i.test(line)) {
                this.highlight('compress');
                if (phase) phase.innerText = 'Step 2: compress blocks (conceptual)';
            }

            if (/✅\s*Original Hash/i.test(line) || /Original Hash/i.test(line)) {
                this.highlight('digest');
                if (phase) phase.innerText = 'Step 3: emit 256-bit digest (hex)';
                // next line contains the digest
                const next = steps[i + 1] ? steps[i + 1].toString().trim() : '';
                if (next && /^[0-9a-fA-F]{64}$/.test(next.replace(/\s+/g, ''))) {
                    originalHash = next.replace(/\s+/g, '');
                }
            }

            const mi = line.match(/Modified Input:\s*'(.+)'/);
            if (mi) {
                modifiedInput = mi[1];
                if (modLabel) modLabel.innerText = `Input: '${modifiedInput.slice(0, 20)}${modifiedInput.length > 20 ? '…' : ''}'`;
            }

            if (/Modified Hash/i.test(line)) {
                const next = steps[i + 1] ? steps[i + 1].toString().trim() : '';
                if (next && /^[0-9a-fA-F]{64}$/.test(next.replace(/\s+/g, ''))) {
                    modifiedHash = next.replace(/\s+/g, '');
                }
            }

            if (/⚡\s*Avalanche/i.test(line)) {
                this.highlight('avalanche');
                if (phase) phase.innerText = 'Step 4: avalanche effect (one char change → many digest changes)';
            }

            if (/Hex difference/i.test(line)) {
                this.highlight('avalanche');
                if (phase) phase.innerText = diff != null ? `Avalanche: ~${diff}/64 hex characters changed` : 'Avalanche: many hex characters changed';
            }

            // Per-letter UTF-8 byte reveal once (feels like RSA/AES pacing)
            if (i === 1) {
                this.highlight('bytes');
                if (phase) phase.innerText = 'Step 2: UTF-8 bytes (preview)';
                const t = (input || '').slice(0, 8);
                for (let j = 0; j < t.length; j++) {
                    await this.animateCharToByte(j, t[j]);
                }
                this.highlight('compress');
                if (phase) phase.innerText = 'Step 3: compression rounds (internal)';
            }
        }

        if (outEl) outEl.innerText = originalHash ? `${originalHash.slice(0, 32)}…` : '—';

        this.highlight('digest');
        if (phase) phase.innerText = 'Digest preview (hex groups)';
        this.renderDigestChips(d1, originalHash, { maxGroups: 16 });
        await this.animateDigestBuild(d1);

        if (modifiedHash) {
            this.highlight('avalanche');
            if (phase) phase.innerText = 'Avalanche: compare two digests';
            this.renderDigestChips(d2, modifiedHash, { maxGroups: 16 });
            await this.animateDigestBuild(d2);
        } else {
            if (d2) d2.innerHTML = `<span class="sha-chip sha-chip-ghost">—</span>`;
        }

        if (diffMeta) {
            diffMeta.innerText = diff != null ? `~${diff}/64 changed` : '';
        }
    }
};
