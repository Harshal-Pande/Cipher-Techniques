window.AnimSHA = {
    ensureVisuals: function() {
        const host = document.getElementById('sha256-visuals');
        if (!host) return null;
        host.style.display = 'flex';
        host.innerHTML = `
            <div class="sha-stage">
                <div class="sha-hud">
                    <div class="sha-title mono"><i class="fa-solid fa-hashtag"></i> SHA-256 HASH FORGE</div>
                    <div class="sha-phase mono" id="sha-phase">Step 1: compress → Step 2: emit digest</div>
                </div>
                <div class="sha-digest mono" id="sha-digest"></div>
            </div>
        `;
        return host;
    },

    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;

        this.ensureVisuals();
        if (charStrip) charStrip.innerHTML = '';

        // Dynamic: show avalanche effect numbers + digest chips (no list)
        const phase = document.getElementById('sha-phase');
        if (phase) phase.innerText = 'Step 1: compress input → Step 2: emit digest';

        let diff = null;
        for (const s of steps) {
            const m = s && s.toString().match(/Hex difference:\s*~(\d+)/i);
            if (m) { diff = parseInt(m[1], 10); break; }
        }
        if (diff !== null && phase) phase.innerText = `Avalanche: ~${diff}/64 hex chars changed`;

        const digest = document.getElementById('sha-digest');
        if (phase) phase.innerText = (diff !== null) ? `Step 2: digest preview + avalanche (~${diff}/64)` : 'Step 2: Emit digest (hex preview)';
        if (digest && data.encrypted) {
            const chunks = data.encrypted.replace(/[^0-9a-fA-F]/g, '').substring(0, 48).match(/.{1,4}/g) || [];
            digest.innerHTML = chunks.slice(0, 10).map(c => `<span class="sha-chip">${c.toLowerCase()}</span>`).join('') + (chunks.length > 10 ? `<span class="sha-chip sha-chip-ghost">…</span>` : '');
            if (window.gsap) gsap.fromTo('.sha-chip', { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, stagger: 0.03 });
        }

        if (window.quizEngine && window.quizEngine.enabled) {
            await window.animDelay();
            await window.quizEngine.askGenericQuestion(
                'SHA-256 Hashing',
                `Which statement is true about SHA-256?`,
                [{ text: 'It is one-way (not decryptable)', isCorrect: true }, { text: 'It uses a secret key like AES', isCorrect: false }],
                digest
            );
        }
    }
};
