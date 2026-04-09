class QuizEngine {
    constructor() {
        this.enabled = true; 
        this.currentResolve = null;
        this.score = 0;
        this.total = 0;
        this.initDOM();
    }

    initDOM() {
        if (!document.getElementById('quiz-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'quiz-overlay';
            overlay.className = 'quiz-overlay hidden';
            
            overlay.innerHTML = `
                <div class="quiz-box" id="quiz-box-main">
                    <div class="quiz-header">
                        <h3><i class="fa-solid fa-graduation-cap"></i> Interactive Learning</h3>
                        <div class="quiz-score-badge"><i class="fa-solid fa-star" style="color:gold;"></i> <span id="quiz-score-text">0</span> XP</div>
                        <button id="quiz-close" class="quiz-close-btn"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="quiz-body" id="quiz-body-content">
                        <!-- Content injected dynamically -->
                    </div>
                    <div class="quiz-feedback" id="quiz-feedback"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('quiz-close').addEventListener('click', () => {
                this.finishQuestion(true); 
            });
        }
    }

    updateScore(pts) {
        this.score += pts;
        document.getElementById('quiz-score-text').innerText = this.score;
        const badge = document.querySelector('.quiz-score-badge');
        badge.style.transform = 'scale(1.2)';
        badge.style.color = '#10b981';
        setTimeout(() => { badge.style.transform = 'scale(1)'; badge.style.color = 'inherit'; }, 300);
    }

    async askCaesarQuestion(parsedData, targetElement) {
        if (!this.enabled || !parsedData) return;
        return this.showPrompt(
            `Caesar Cipher Shift`,
            `The letter <strong style="color:var(--accent);font-size:1.2em;">${parsedData.from}</strong> is at index <strong>${parsedData.origPos}</strong>.<br>If we <strong style="color:var(--error);">${parsedData.op === '+' ? 'add' : 'subtract'}</strong> a shift of <strong>${parsedData.shift}</strong>, what is the new mathematical index before modulo?`,
            [{text: parsedData.newPos, isCorrect: true}, {text: parseInt(parsedData.newPos) + 1, isCorrect: false}, {text: parseInt(parsedData.newPos) - 1, isCorrect: false}, {text: parseInt(parsedData.origPos) + parseInt(parsedData.shift) + 2, isCorrect: false}].sort(() => Math.random() - 0.5),
            targetElement
        );
    }

    async askVigenereQuestion(parsedData, targetElement) {
        if (!this.enabled || !parsedData) return;
        return this.showPrompt(
            `Vigenère Polyalphabetic`,
            `Input <strong style="color:var(--accent);">${parsedData.from}</strong> shifted by key <strong style="color:var(--error);">${parsedData.key}</strong> (value ${parsedData.kval}).<br>What character does this result in according to the Vigenère square?`,
            [{text: parsedData.to, isCorrect: true}, {text: String.fromCharCode(((parsedData.to.charCodeAt(0) - 65 + 1) % 26) + 65), isCorrect: false}, {text: String.fromCharCode(((parsedData.to.charCodeAt(0) - 65 + 2) % 26) + 65), isCorrect: false}].sort(() => Math.random() - 0.5),
            targetElement
        );
    }

    async askGenericQuestion(algoTitle, question, options, targetElement) {
        if (!this.enabled) return;
        return this.showPrompt(algoTitle, question, options, targetElement);
    }

    showPrompt(title, questionHtml, options, targetElement) {
        return new Promise(resolve => {
            this.currentResolve = resolve;
            this.total++;

            const overlay = document.getElementById('quiz-overlay');
            const body = document.getElementById('quiz-body-content');
            const feedback = document.getElementById('quiz-feedback');
            const box = document.getElementById('quiz-box-main');
            
            feedback.innerHTML = '';
            feedback.className = 'quiz-feedback';
            box.classList.remove('shake');

            let optionsHtml = options.map((opt, i) => 
                `<button class="quiz-option-btn pop-anim" style="animation-delay:${i * 0.1}s" data-correct="${opt.isCorrect}">${opt.text}</button>`
            ).join('');

            body.innerHTML = `
                <h4 style="color:var(--accent); margin-bottom: 10px; font-size: 1.1rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 5px;">${title}</h4>
                <p style="margin-bottom: 20px; font-size: 0.95rem; line-height: 1.5;">${questionHtml}</p>
                <div class="quiz-options">
                    ${optionsHtml}
                </div>
            `;

            overlay.classList.remove('hidden');
            
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                box.style.top = (rect.top - 15) + 'px';
                box.style.left = Math.min(rect.right + 25, window.innerWidth - box.offsetWidth - 20) + 'px';
            } else {
                box.style.top = '50%';
                box.style.left = '50%';
                box.style.transform = 'translate(-50%, -50%)';
            }

            const btns = body.querySelectorAll('.quiz-option-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const isCorrect = e.target.dataset.correct === 'true';
                    
                    // Disable all buttons after click
                    btns.forEach(b => b.disabled = true);
                    
                    if (isCorrect) {
                        this.updateScore(10);
                        e.target.style.backgroundColor = 'var(--success)';
                        e.target.style.color = '#fff';
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 0 15px rgba(16,185,129,0.6)';
                        feedback.innerHTML = '<i class="fa-solid fa-star" style="color:gold;"></i> Excellent!';
                        feedback.className = 'quiz-feedback success';
                        setTimeout(() => this.finishQuestion(true), 1200);
                    } else {
                        box.classList.add('shake');
                        e.target.style.backgroundColor = 'var(--error)';
                        e.target.style.color = '#fff';
                        feedback.innerHTML = '<i class="fa-solid fa-xmark"></i> Incorrect! Passing...';
                        feedback.className = 'quiz-feedback error';
                        setTimeout(() => this.finishQuestion(false), 1500);
                    }
                });
            });
        });
    }

    finishQuestion(result) {
        document.getElementById('quiz-overlay').classList.add('hidden');
        if (this.currentResolve) {
            this.currentResolve(result);
            this.currentResolve = null;
        }
    }
}

window.quizEngine = new QuizEngine();
