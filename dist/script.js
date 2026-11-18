/**
 * Configuration de l'expérience de contact.
 * Les valeurs sont définies dans config.js afin d'éviter de modifier ce fichier.
 */
const siteConfig = window.SYNUMANUS_CONFIG || {};

/**
 * setupWhatsAppLinks(): void
 * Configure tous les liens portant [data-whatsapp-link].
 */
const setupWhatsAppLinks = () => {
  const links = document.querySelectorAll('[data-whatsapp-link]');
  const phone = String(siteConfig.whatsappPhone || '').replace(/\D/g, '');
  const message = encodeURIComponent(siteConfig.whatsappMessage || 'Bonjour Synumanus, je souhaite échanger au sujet de mon projet d’application mobile.');

  links.forEach((link) => {
    if (phone) {
      link.href = `https://wa.me/${phone}?text=${message}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('data-needs-config');
      return;
    }

    link.href = '#';
    link.dataset.needsConfig = 'true';
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.alert('Le bouton WhatsApp est prêt. Ajoutez votre numéro au format international dans config.js (ex. 33612345678).');
    });
  });
};

/**
 * setupNewsletterForm(): void
 * Valide le formulaire et envoie les données à l'endpoint configuré.
 * L'endpoint serveur doit accepter un POST JSON { email, consent, source }.
 */
const setupNewsletterForm = () => {
  const form = document.querySelector('[data-newsletter-form]');
  const status = document.querySelector('[data-newsletter-status]');
  if (!form || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.classList.remove('error');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const endpoint = String(siteConfig.systemeIoNewsletterEndpoint || '').trim();
    const formData = new FormData(form);
    const email = formData.get('email');
    const consent = formData.get('consent') === 'on';

    if (!endpoint) {
      status.textContent = 'Formulaire prêt : renseignez systemeIoNewsletterEndpoint dans config.js pour activer les inscriptions via systeme.io.';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const initialLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Inscription…';
    status.textContent = '';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, source: 'synumanus-homepage' })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      status.textContent = 'Merci. Votre inscription a bien été prise en compte.';
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      status.classList.add('error');
      status.textContent = 'L’inscription n’a pas pu être envoyée. Réessayez ou contactez Synumanus par email.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = initialLabel;
    }
  });
};

setupWhatsAppLinks();
setupNewsletterForm();

document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const year = document.querySelector('[data-year]');


/**
 * setupClickHub(options): void
 * Configure un Hub accessible au clic sur desktop et mobile.
 * @param {{desktopHub:string,desktopTrigger:string,mobileHub:string,mobileTrigger:string}} options
 */
const setupClickHub = ({ desktopHub, desktopTrigger, mobileHub, mobileTrigger }) => {
  const desktopHubEl = document.querySelector(desktopHub);
  const desktopTriggerEl = document.querySelector(desktopTrigger);
  const mobileHubEl = document.querySelector(mobileHub);
  const mobileTriggerEl = document.querySelector(mobileTrigger);

  const setDesktopOpen = (open) => {
    if (!desktopHubEl || !desktopTriggerEl) return;
    document.querySelectorAll('.nav-hub.open').forEach((hub) => {
      if (hub !== desktopHubEl) {
        hub.classList.remove('open');
        hub.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
      }
    });
    desktopHubEl.classList.toggle('open', open);
    desktopTriggerEl.setAttribute('aria-expanded', String(open));
  };

  const setMobileOpen = (open) => {
    if (!mobileHubEl || !mobileTriggerEl) return;
    document.querySelectorAll('.mobile-service-hub.open').forEach((hub) => {
      if (hub !== mobileHubEl) {
        hub.classList.remove('open');
        hub.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
      }
    });
    mobileHubEl.classList.toggle('open', open);
    mobileTriggerEl.setAttribute('aria-expanded', String(open));
  };

  if (desktopHubEl && desktopTriggerEl) {
    desktopTriggerEl.addEventListener('click', (event) => {
      event.stopPropagation();
      setDesktopOpen(!desktopHubEl.classList.contains('open'));
    });
    desktopHubEl.addEventListener('click', (event) => event.stopPropagation());
  }

  if (mobileHubEl && mobileTriggerEl) {
    mobileTriggerEl.addEventListener('click', () => {
      setMobileOpen(!mobileHubEl.classList.contains('open'));
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setDesktopOpen(false);
    setMobileOpen(false);
  });
};

/** setupNavigationHubs(): void — initialise Service + Secteurs + Ressources. */
const setupNavigationHubs = () => {
  setupClickHub({
    desktopHub: '[data-service-hub]', desktopTrigger: '[data-service-hub-trigger]',
    mobileHub: '[data-mobile-service-hub]', mobileTrigger: '[data-mobile-service-hub-trigger]'
  });
  setupClickHub({
    desktopHub: '[data-sector-hub]', desktopTrigger: '[data-sector-hub-trigger]',
    mobileHub: '[data-mobile-sector-hub]', mobileTrigger: '[data-mobile-sector-hub-trigger]'
  });
  setupClickHub({
    desktopHub: '[data-resource-hub]', desktopTrigger: '[data-resource-hub-trigger]',
    mobileHub: '[data-mobile-resource-hub]', mobileTrigger: '[data-mobile-resource-hub-trigger]'
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-hub.open').forEach((hub) => {
      hub.classList.remove('open');
      hub.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
    });
  });
};

if (year) year.textContent = new Date().getFullYear();
setupNavigationHubs();

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 24);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);

    if (!isOpen) {
      document.querySelectorAll('.mobile-service-hub.open').forEach((hub) => {
        hub.classList.remove('open');
        hub.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      document.querySelectorAll('.mobile-service-hub.open').forEach((hub) => {
        hub.classList.remove('open');
        hub.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
      });
    });
  });
}

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const faqList = document.querySelector('[data-faq-list]');
if (faqList) {
  faqList.querySelectorAll('details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      faqList.querySelectorAll('details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
}

const solutionItems = document.querySelectorAll('[data-solution]');
solutionItems.forEach((item) => {
  item.addEventListener('mouseenter', () => {
    solutionItems.forEach((other) => other.classList.remove('active'));
    item.classList.add('active');
  });
});
