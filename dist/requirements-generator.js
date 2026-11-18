
/**
 * setupRequirementsGenerator(): void
 * Génère localement un premier brouillon de cahier des charges.
 * Aucune donnée n'est envoyée au serveur.
 */
const setupRequirementsGenerator = () => {
  const form = document.querySelector('[data-requirements-form]');
  const output = document.querySelector('[data-generated-brief]');
  const copyButton = document.querySelector('[data-copy-brief]');
  const downloadButton = document.querySelector('[data-download-brief]');
  if (!form || !output) return;

  const value = (data, key, fallback = 'À préciser') => String(data.get(key) || '').trim() || fallback;

  const buildBrief = () => {
    const data = new FormData(form);
    return [
      '# Cahier des charges — premier brouillon',
      '',
      `Projet : ${value(data, 'projectName')}`,
      `Type : ${value(data, 'projectType')}`,
      '',
      '## 1. Contexte',
      value(data, 'context'),
      '',
      '## 2. Objectif métier',
      value(data, 'objective'),
      '',
      '## 3. Utilisateurs concernés',
      value(data, 'users'),
      '',
      '## 4. Fonctions essentielles',
      value(data, 'features'),
      '',
      '## 5. Données, API et intégrations',
      value(data, 'integrations'),
      '',
      '## 6. Contraintes',
      value(data, 'constraints'),
      '',
      '## 7. Budget envisagé',
      value(data, 'budget'),
      '',
      '## 8. Calendrier',
      value(data, 'timing'),
      '',
      '## 9. Prochaine étape',
      'Valider le problème métier, prioriser une V1 et confronter les hypothèses techniques avant développement.'
    ].join('\n');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    output.textContent = buildBrief();
    output.dataset.ready = 'true';
  });

  copyButton?.addEventListener('click', async () => {
    const text = output.textContent.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = 'Copié ✓';
      setTimeout(() => { copyButton.textContent = 'Copier'; }, 1600);
    } catch (_) {
      window.alert('La copie automatique est indisponible. Sélectionnez le texte manuellement.');
    }
  });

  downloadButton?.addEventListener('click', () => {
    const text = output.textContent.trim();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cahier-des-charges-synumanus.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
};

setupRequirementsGenerator();
