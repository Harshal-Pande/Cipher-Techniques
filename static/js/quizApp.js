(() => {
  const tech = document.querySelector('meta[name="quiz-technique"]')?.content || '';
  const level = document.querySelector('meta[name="quiz-level"]')?.content || '';

  const $ = (id) => document.getElementById(id);
  const qProgress = $('q-progress');
  const qTime = $('q-time');
  const qScore = $('q-score');
  const qHigh = $('q-high');
  const qTitle = $('q-title');
  const qSub = $('q-sub');
  const qOptions = $('q-options');
  const qFeedback = $('q-feedback');
  const btnNext = $('btn-next');

  const BANK = window.CRYPTO_QUIZ_BANK || {};
  const questions = BANK?.[tech]?.[level] || [];

  const TOTAL = questions.length || 10;
  const timePerQ = level === 'easy' ? 20 : level === 'medium' ? 15 : 12;

  const hsKey = `cryptolab_highscore:${tech}:${level}`;
  const getHigh = () => parseInt(localStorage.getItem(hsKey) || '0', 10) || 0;
  const setHigh = (v) => localStorage.setItem(hsKey, String(v));

  let idx = 0;
  let score = 0;
  let timeLeft = timePerQ;
  let timer = null;
  let locked = false;
  let lastCorrect = false;

  function stopTimer() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function startTimer() {
    stopTimer();
    timeLeft = timePerQ;
    qTime.innerText = String(timeLeft);
    timer = window.setInterval(() => {
      timeLeft -= 1;
      qTime.innerText = String(Math.max(0, timeLeft));
      if (timeLeft <= 0) {
        lockAndReveal(null, true);
      }
    }, 1000);
  }

  function renderHigh() {
    qHigh.innerText = String(getHigh());
  }

  function render() {
    locked = false;
    lastCorrect = false;
    btnNext.disabled = true;
    qFeedback.innerText = '';
    qOptions.innerHTML = '';

    const q = questions[idx];
    if (!q) {
      finish();
      return;
    }

    qProgress.innerText = `Q ${idx + 1}/${TOTAL}`;
    qScore.innerText = String(score);
    renderHigh();

    qTitle.innerText = q.prompt;
    qSub.innerText = q.sub || '';

    q.options.forEach((opt, optIdx) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.type = 'button';
      b.innerText = opt;
      b.addEventListener('click', () => lockAndReveal(optIdx, false));
      qOptions.appendChild(b);
    });

    startTimer();
  }

  function lockAndReveal(choiceIdx, timedOut) {
    if (locked) return;
    locked = true;
    stopTimer();

    const q = questions[idx];
    const correctIdx = q.answerIndex;
    const buttons = Array.from(qOptions.querySelectorAll('button.quiz-opt'));
    buttons.forEach((b) => (b.disabled = true));

    if (buttons[correctIdx]) buttons[correctIdx].classList.add('correct');
    if (choiceIdx !== null && choiceIdx !== correctIdx && buttons[choiceIdx]) buttons[choiceIdx].classList.add('wrong');

    lastCorrect = !timedOut && choiceIdx === correctIdx;

    if (lastCorrect) {
      const base = level === 'easy' ? 100 : level === 'medium' ? 150 : 200;
      const timeBonus = Math.max(0, timeLeft) * (level === 'easy' ? 2 : level === 'medium' ? 3 : 4);
      score += base + timeBonus;
      qFeedback.innerText = `Correct. +${base + timeBonus} points`;
    } else {
      qFeedback.innerText = timedOut ? 'Time up. No points.' : 'Wrong. No points.';
    }

    qScore.innerText = String(score);
    btnNext.disabled = false;
  }

  function finish() {
    stopTimer();
    const high = getHigh();
    const beatHigh = score > high;
    if (beatHigh) setHigh(score);
    renderHigh();
    if (window.CryptolabStorage && tech && level) {
      window.CryptolabStorage.recordQuizFinish(tech, level, score, beatHigh);
    }

    qTitle.innerText = 'Quiz complete';
    qSub.innerText = `Final score: ${score} • High score: ${getHigh()}`;
    qOptions.innerHTML = '';
    qFeedback.innerText = 'Use the back button to choose another level.';
    btnNext.disabled = true;
  }

  btnNext?.addEventListener('click', () => {
    idx += 1;
    render();
  });

  if (!tech || !level || questions.length === 0) {
    qTitle.innerText = 'Question bank missing';
    qSub.innerText = 'No questions found for this technique/level.';
    qOptions.innerHTML = '';
    btnNext.disabled = true;
  } else {
    render();
  }
})();

