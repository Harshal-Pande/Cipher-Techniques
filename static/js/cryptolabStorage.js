/**
 * Browser local persistence for CryptoLab: simulator UI + session cache + quiz aggregates.
 * Keys are namespaced; data stays on this device only.
 */
(function () {
    const SIM_KEY = 'cryptolab_simulator_v1';
    const QUIZ_AGG_KEY = 'cryptolab_quiz_aggregate_v1';
    const HS_PREFIX = 'cryptolab_highscore:';

    function safeParse(json, fallback) {
        try {
            return json ? JSON.parse(json) : fallback;
        } catch {
            return fallback;
        }
    }

    function saveSimulator(state) {
        try {
            const payload = {
                v: 1,
                savedAt: new Date().toISOString(),
                algorithm: state.algorithm || '',
                plaintext: state.plaintext || '',
                key: state.key || '',
                speedSlider: state.speedSlider || '1',
                encryptedOutput: state.encryptedOutput || '',
                decryptedOutput: state.decryptedOutput || '',
                cacheData: state.cacheData,
                cacheInputText: state.cacheInputText || '',
                cacheAlgo: state.cacheAlgo || '',
                flowBarText: state.flowBarText || '',
                flowBarVisible: !!state.flowBarVisible,
                lastStepsTitle: state.lastStepsTitle || '',
                lastSteps: Array.isArray(state.lastSteps) ? state.lastSteps.slice(0, 500) : []
            };
            localStorage.setItem(SIM_KEY, JSON.stringify(payload));
        } catch (e) {
            console.warn('CryptolabStorage: could not save simulator state', e);
        }
    }

    function loadSimulator() {
        return safeParse(localStorage.getItem(SIM_KEY), null);
    }

    function clearSimulator() {
        localStorage.removeItem(SIM_KEY);
    }

    /** Sync single-run high score keys into aggregate record (backup + quiz home UI). */
    function syncHighScoresFromKeys() {
        const agg = safeParse(localStorage.getItem(QUIZ_AGG_KEY), {});
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k || !k.startsWith(HS_PREFIX)) continue;
            const rest = k.slice(HS_PREFIX.length);
            const parts = rest.split(':');
            if (parts.length < 2) continue;
            const level = parts.pop();
            const tech = parts.join(':');
            const score = parseInt(localStorage.getItem(k) || '0', 10) || 0;
            const key = `${tech}:${level}`;
            if (!agg.scores) agg.scores = {};
            const prev = agg.scores[key];
            if (!prev || score > prev.best) {
                agg.scores[key] = { best: score, source: 'runtime' };
            }
        }
        agg.syncedAt = new Date().toISOString();
        try {
            localStorage.setItem(QUIZ_AGG_KEY, JSON.stringify(agg));
        } catch (e) {
            console.warn('CryptolabStorage: quiz aggregate save failed', e);
        }
    }

    function recordQuizFinish(tech, level, score, wasNewHigh) {
        syncHighScoresFromKeys();
        const agg = safeParse(localStorage.getItem(QUIZ_AGG_KEY), {});
        if (!agg.scores) agg.scores = {};
        const key = `${tech}:${level}`;
        const prev = agg.scores[key];
        const best = Math.max(prev?.best || 0, score);
        agg.scores[key] = {
            best,
            last: score,
            lastAt: new Date().toISOString(),
            lastWasHigh: !!wasNewHigh
        };
        agg.lastSession = { tech, level, score, at: new Date().toISOString() };
        try {
            localStorage.setItem(QUIZ_AGG_KEY, JSON.stringify(agg));
        } catch (e) {
            console.warn('CryptolabStorage: recordQuizFinish failed', e);
        }
    }

    function getQuizAggregate() {
        syncHighScoresFromKeys();
        return safeParse(localStorage.getItem(QUIZ_AGG_KEY), { scores: {} });
    }

    /** Readable HTML for quiz home (static layout; scores are escaped). */
    function formatQuizSummaryHtml() {
        syncHighScoresFromKeys();
        const agg = getQuizAggregate();
        const scores = agg.scores || {};
        const esc = (s) => {
            const d = document.createElement('div');
            d.textContent = s == null ? '' : String(s);
            return d.innerHTML;
        };

        const techniques = [
            { id: 'caesar', name: 'Caesar' },
            { id: 'vigenere', name: 'Vigenère' },
            { id: 'aes', name: 'AES-256' },
            { id: 'rsa', name: 'RSA-2048' },
            { id: 'sha256', name: 'SHA-256' }
        ];
        const levels = ['easy', 'medium', 'hard'];

        let rows = '';
        for (const t of techniques) {
            for (const lv of levels) {
                const k = `${t.id}:${lv}`;
                const rec = scores[k];
                const best = rec?.best;
                if (best == null || best === 0) continue;
                rows += `<tr><td>${esc(t.name)}</td><td>${esc(lv)}</td><td class="mono">${esc(best)}</td></tr>`;
            }
        }

        const sess = agg.lastSession;
        const last = sess
            ? `<p class="quiz-summary-last mono">Last quiz: <strong>${esc(sess.tech)}</strong> • score ${esc(sess.score)} • ${esc(sess.at?.slice(0, 19) || '')}</p>`
            : '';

        if (!rows) {
            return (
                '<div class="quiz-summary-empty">' +
                '<p><strong>No saved high scores yet.</strong> Finish a quiz run to record scores in this browser.</p>' +
                last +
                '</div>'
            );
        }

        return (
            last +
            '<div class="quiz-summary-table-wrap">' +
            '<table class="quiz-summary-table">' +
            '<thead><tr><th>Technique</th><th>Level</th><th>Best score</th></tr></thead>' +
            '<tbody>' +
            rows +
            '</tbody></table></div>' +
            '<p class="quiz-summary-note">Scores are stored locally in your browser (localStorage).</p>'
        );
    }

    window.CryptolabStorage = {
        saveSimulator,
        loadSimulator,
        clearSimulator,
        recordQuizFinish,
        getQuizAggregate,
        formatQuizSummaryHtml,
        syncHighScoresFromKeys
    };
})();
