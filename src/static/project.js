/**
 * setupProjectForm(): void
 * Gère le parcours complet « Démarrer un projet » :
 * 1–4. qualification + coordonnées,
 * 5. calendrier de réservation systeme.io.
 */
const setupProjectForm = () => {
  const form = document.querySelector('[data-project-form]');
  if (!form) return;

  const TOTAL_FLOW_STEPS = 5;
  const BOOKING_STEP = 5;
  const STORAGE_KEY = 'synumanusProjectSubmitted';
  const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
  const tabId = randomToken();
  let submissionToken = randomToken();
  let trackingToken = null;
  let presenceTimer = null;
  let presencePending = false;
  let pageLeaving = false;
  let sending = false;
  const presenceEndpoint = window.SYNUMANUS_CONFIG?.projectPresenceEndpoint || '/api/project-presence.php';

  const signalPresence = async (event = 'present', beacon = false) => {
    if (!trackingToken || (pageLeaving && event !== 'leave')) return;
    const body = JSON.stringify({ token: trackingToken, tabId, event });
    if (beacon && navigator.sendBeacon?.(presenceEndpoint, new Blob([body], { type: 'application/json' }))) return;
    if (presencePending && !beacon) return;
    if (!beacon) presencePending = true;
    try {
      const response = await fetch(presenceEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
        keepalive: true, signal: AbortSignal.timeout(10000)
      });
      if (response.ok) {
        const result = await response.json();
        if (result.appointment_booked) clearInterval(presenceTimer);
      }
    } catch (_) { /* Une présence perdue est gérée par le délai de grâce du serveur. */ }
    finally { if (!beacon) presencePending = false; }
  };

  const startPresence = () => {
    clearInterval(presenceTimer);
    signalPresence();
    presenceTimer = setInterval(() => signalPresence(), 30000);
  };
  window.addEventListener('pagehide', () => {
    pageLeaving = true;
    clearInterval(presenceTimer);
    signalPresence('leave', true);
  });
  window.addEventListener('pageshow', () => {
    pageLeaving = false;
    if (trackingToken) startPresence();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && trackingToken) startPresence();
    else signalPresence('present', true);
  });

  const steps = [...form.querySelectorAll('[data-step]')];
  const nextButton = form.querySelector('[data-next-step]');
  const prevButton = form.querySelector('[data-prev-step]');
  const submitButton = form.querySelector('[data-submit-project]');
  const nav = form.querySelector('[data-form-navigation]');
  const errorBox = form.querySelector('[data-form-error]');
  const bookingStage = document.querySelector('[data-booking-stage]');
  const calendarFrame = document.querySelector('[data-systemeio-calendar-frame]');
  const calendarLocalMock = document.querySelector('[data-calendar-local-mock]');
  const localBookingConfirm = document.querySelector('[data-local-booking-confirm]');
  const progressWrap = document.querySelector('.form-progress-wrap');
  const stepLabel = document.querySelector('[data-step-label]');
  const progressBar = document.querySelector('[data-progress-bar]');
  let currentStep = 0;
  const historyItems = [...document.querySelectorAll('[data-history-step]')];
  const answers = new Map();
  let submitted = false;

  const rememberStep = (index) => {
    const values = [...steps[index].querySelectorAll('input, textarea, select')]
      .filter(field => !['radio', 'checkbox'].includes(field.type) || field.checked)
      .map(field => field.value.trim()).filter(Boolean);
    answers.set(index, values.join(' · '));
  };

  const renderHistory = (activeIndex) => {
    historyItems.forEach((item, index) => {
      const complete = answers.has(index) || (submitted && index < steps.length);
      const current = index === activeIndex;
      item.classList.toggle('is-complete', complete);
      item.classList.toggle('is-current', current);
      const button = item.querySelector('button');
      button.disabled = submitted || !complete || index >= activeIndex;
      if (current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      item.querySelector('.history-number').textContent = complete ? '✓' : String(index + 1);
      item.querySelector('[data-history-answer]').textContent = answers.get(index) || (current ? 'En cours' : complete ? 'Validé' : 'À venir');
    });
  };

  const focusStep = () => {
    const heading = steps[currentStep].querySelector('h2');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    progressWrap?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const params = new URLSearchParams(window.location.search);
  const bookingConfirmed = params.get('booking') === 'confirmed';

  /** setError(message?: string): void */
  const setError = (message = '') => {
    if (!errorBox) return;
    errorBox.hidden = !message;
    errorBox.textContent = message;
  };

  /** setProgress(stepNumber: number): void */
  const setProgress = (stepNumber) => {
    renderHistory(stepNumber - 1);
    if (progressWrap) progressWrap.hidden = false;
    if (stepLabel) stepLabel.textContent = `Étape ${stepNumber} / ${TOTAL_FLOW_STEPS}`;
    progressBar?.parentElement.setAttribute('aria-valuenow', String(stepNumber));
    if (progressBar) {
      const advancement = Math.max(0, Math.min(1, (stepNumber - 1) / (TOTAL_FLOW_STEPS - 1)));
      progressBar.style.width = `${(stepNumber / TOTAL_FLOW_STEPS) * 100}%`;
      progressBar.style.backgroundColor = `hsl(212, 85%, ${25 + advancement * 40}%)`;
    }
  };

  /** fieldsForStep(step: Element): HTMLElement[] */
  const fieldsForStep = (step) => [...step.querySelectorAll('input, textarea, select')]
    .filter((field) => field.type !== 'hidden' && field.name !== 'website');

  /** validateStep(step: Element): boolean */
  const validateStep = (step) => {
    setError('');
    let firstInvalid = null;

    fieldsForStep(step).forEach((field) => {
      field.classList.remove('is-invalid');
      if (!field.checkValidity()) {
        if (!firstInvalid) firstInvalid = field;
        field.classList.add('is-invalid');
      }
    });

    if (firstInvalid) {
      setError('Complétez les champs obligatoires avant de continuer.');
      if (firstInvalid.type !== 'radio' && firstInvalid.type !== 'checkbox') {
        firstInvalid.focus({ preventScroll: true });
      }
      step.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    return true;
  };

  /** redirectLowBudgetProject(): boolean */
  const redirectLowBudgetProject = () => {
    const projectType = form.querySelector('input[name="projectType"]:checked')?.value;
    const budget = form.querySelector('input[name="budget"]:checked')?.value;
    if (!projectType || projectType === 'Cadrage' || budget !== 'Moins de 7 000 € HT') {
      return false;
    }
    window.location.assign('/ressources/generateur-cahier-des-charges/');
    return true;
  };

  /** calendarConfirmationUrl(): string */
  const calendarConfirmationUrl = () => {
    const configured = String(window.SYNUMANUS_CONFIG?.systemeIoBookingConfirmationUrl || '').trim();
    return configured || '/';
  };

  /** mountSystemeIoCalendar(): void */
  const mountSystemeIoCalendar = () => {
    const calendarUrl = String(window.SYNUMANUS_CONFIG?.systemeIoCalendarUrl || '').trim();

    if (calendarUrl) {
      if (calendarFrame) {
        calendarFrame.src = calendarUrl;
        calendarFrame.hidden = false;
      }
      if (calendarLocalMock) calendarLocalMock.hidden = true;
      return;
    }

    if (isLocal && calendarLocalMock) {
      calendarLocalMock.hidden = false;
      if (calendarFrame) calendarFrame.hidden = true;
      return;
    }

    if (calendarFrame) calendarFrame.hidden = true;
    if (calendarLocalMock) calendarLocalMock.hidden = true;
  };

  /** showBookingStage(): void */
  const showBookingStage = () => {
    submitted = true;
    form.hidden = true;
    if (bookingStage) bookingStage.hidden = false;
    setProgress(BOOKING_STEP);
    mountSystemeIoCalendar();
    startPresence();
    bookingStage?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** renderFormStep(): void */
  const renderFormStep = () => {
    form.hidden = false;
    if (bookingStage) bookingStage.hidden = true;

    steps.forEach((step, index) => step.classList.toggle('is-active', index === currentStep));
    setProgress(currentStep + 1);

    if (prevButton) prevButton.disabled = currentStep === 0;
    const isLastFormStep = currentStep === steps.length - 1;

    if (nextButton) {
      nextButton.hidden = isLastFormStep;
      nextButton.style.display = isLastFormStep ? 'none' : '';
      nextButton.setAttribute('aria-hidden', String(isLastFormStep));
    }
    if (submitButton) {
      submitButton.hidden = !isLastFormStep;
      submitButton.style.display = isLastFormStep ? '' : 'none';
      submitButton.setAttribute('aria-hidden', String(!isLastFormStep));
    }
    setError('');
  };

  // Si systeme.io redirige la réservation dans l'iframe vers notre URL,
  // la page redevient same-origin et peut revenir à l’accueil au niveau top.
  if (bookingConfirmed && window.self !== window.top) {
    try {
      window.top.location.href = '/';
      return;
    } catch (_) { /* le rendu local prendra le relais */ }
  }

  if (bookingConfirmed) {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) { /* no-op */ }
    window.location.replace('/');
    return;
  }

  // Chaque chargement recommence le formulaire, même après une soumission.
  try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) { /* stockage désactivé */ }
  form.reset();

  nextButton?.addEventListener('click', () => {
    if (!validateStep(steps[currentStep])) return;
    if (redirectLowBudgetProject()) return;
    rememberStep(currentStep);
    currentStep = Math.min(currentStep + 1, steps.length - 1);
    renderFormStep();
    focusStep();
  });

  const returnToStep = (index) => {
    currentStep = index;
    for (const completedIndex of answers.keys()) {
      if (completedIndex >= index) answers.delete(completedIndex);
    }
    renderFormStep();
    focusStep();
  };

  prevButton?.addEventListener('click', () => {
    returnToStep(Math.max(currentStep - 1, 0));
  });

  historyItems.forEach((item, index) => {
    item.querySelector('button').addEventListener('click', () => {
      if (submitted || !answers.has(index) || index >= currentStep) return;
      returnToStep(index);
    });
  });

  localBookingConfirm?.addEventListener('click', () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) { /* no-op */ }
    window.location.assign(calendarConfirmationUrl());
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    if (currentStep !== steps.length - 1) { nextButton?.click(); return; }
    for (let index = 0; index < steps.length; index++) {
      if (!validateStep(steps[index])) {
        returnToStep(index);
        validateStep(steps[index]);
        return;
      }
    }
    if (redirectLowBudgetProject()) return;

    const endpoint = String(window.SYNUMANUS_CONFIG?.projectEndpoint || '').trim();
    if (!endpoint) {
      setError('Le formulaire est prêt, mais projectEndpoint doit être configuré dans config.js.');
      return;
    }

    const formData = new FormData(form);
    const payload = { submissionToken, tabId };
    for (const [key, value] of formData.entries()) {
      if (payload[key]) {
        payload[key] = Array.isArray(payload[key]) ? [...payload[key], value] : [payload[key], value];
      } else {
        payload[key] = value;
      }
    }

    sending = true;
    const initialLabel = submitButton?.innerHTML || 'C’est partie';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi…';
    }
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok || !/^[a-f0-9]{64}$/.test(data.trackingToken || '')) {
        throw new Error(data.message || 'L’enregistrement n’a pas pu être confirmé. Veuillez réessayer.');
      }
      trackingToken = data.trackingToken;
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: trackingToken })); } catch (_) { /* no-op */ }
      steps.forEach((_, index) => rememberStep(index));
      form.reset();
      showBookingStage();
    } catch (error) {
      console.error('Project form submission failed:', error);
      setError(error.message || 'La demande n’a pas pu être envoyée. Réessayez ou contactez Synumanus par email/WhatsApp.');
    } finally {
      sending = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = initialLabel;
      }
    }
  });

  renderFormStep();
};

setupProjectForm();
