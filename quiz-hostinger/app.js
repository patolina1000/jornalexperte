// Util: parse UTM da URL e salvar uma vez
function captureUTMs() {
  const params = new URLSearchParams(location.search);
  const utm = {
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_content: params.get('utm_content') || null,
    utm_term: params.get('utm_term') || null,
  };
  // salva apenas se algum campo existir
  if (Object.values(utm).some(Boolean)) {
    localStorage.setItem('quiz.utm', JSON.stringify(utm));
  }
}
captureUTMs();

// Estado
const stateKey = 'quiz.answers';
const answers = JSON.parse(localStorage.getItem(stateKey) || '{}');

// Marca início, se não houver
if (!localStorage.getItem('quiz.timestampStart')) {
  localStorage.setItem('quiz.timestampStart', new Date().toISOString());
}

// Seletores
const optionsEl = document.querySelector('.options');
const cards = Array.from(document.querySelectorAll('.card'));
const cta = document.getElementById('cta');
const toast = document.getElementById('toast');

// Restaura seleção anterior (se existir)
if (answers.q1) {
  const selected = cards.find(c => c.dataset.value === answers.q1);
  if (selected) setSelected(selected, /*silent*/ true);
}

// Clique via mouse/teclado
optionsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.card');
  if (!btn) return;
  setSelected(btn);
});

optionsEl.addEventListener('keydown', (e) => {
  const current = document.activeElement.closest('.card');
  if (!current) return;

  const idx = cards.indexOf(current);
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    const next = cards[Math.min(cards.length - 1, idx + 1)];
    next.focus();
  }
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const prev = cards[Math.max(0, idx - 1)];
    prev.focus();
  }
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    setSelected(current);
  }
});

function setSelected(btn, silent = false) {
  cards.forEach(c => c.setAttribute('aria-checked', 'false'));
  btn.setAttribute('aria-checked', 'true');
  cta.disabled = false;

  answers.q1 = btn.dataset.value;
  localStorage.setItem(stateKey, JSON.stringify(answers));

  if (!silent) announce('Opción seleccionada.');
}

// CTA
cta.addEventListener('click', () => {
  if (cta.disabled) return;
  // já está salvo pelo setSelected; reforça persistência
  localStorage.setItem(stateKey, JSON.stringify(answers));
  announce('Respuesta guardada. Continuaremos en la Parte 2.');
});

// Toast util
let toastTimer;
function announce(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
