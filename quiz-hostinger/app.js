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
const optionGroups = Array.from(document.querySelectorAll('.options'));
const primaryGroup = optionGroups[0] || null;
const primaryButtons = primaryGroup ? Array.from(primaryGroup.querySelectorAll('.option-theme')) : [];
const cta = document.getElementById('cta');
const toast = document.getElementById('toast');

// Restaura seleção anterior (se existir)
if (answers.q1 && primaryButtons.length) {
  const selected = primaryButtons.find(btn => btn.dataset.value === answers.q1);
  if (selected) {
    toggleActive(primaryButtons, selected);
    applyPrimarySelection(selected, { silent: true });
  }
}

optionGroups.forEach(group => {
  const buttons = group === primaryGroup
    ? primaryButtons
    : Array.from(group.querySelectorAll('.option-theme'));

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleActive(buttons, btn);

      if (group === primaryGroup) {
        applyPrimarySelection(btn);
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  group.addEventListener('keydown', (e) => {
    const current = document.activeElement.closest('.option-theme');
    if (!current || !group.contains(current)) return;

    const idx = buttons.indexOf(current);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = buttons[Math.min(buttons.length - 1, idx + 1)];
      if (next) next.focus();
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = buttons[Math.max(0, idx - 1)];
      if (prev) prev.focus();
    }
  });
});

function toggleActive(buttons, activeButton) {
  buttons.forEach(button => {
    button.classList.remove('active');
    button.setAttribute('aria-checked', 'false');
  });

  activeButton.classList.add('active');
  activeButton.setAttribute('aria-checked', 'true');

  const radio = activeButton.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
}

function applyPrimarySelection(btn, { silent = false } = {}) {
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
