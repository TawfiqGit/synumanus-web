/**
 * Configuration publique de la HomePage Synumanus.
 *
 * whatsappPhone : numéro au format international sans +, espaces ni tirets.
 * Exemple France : 33612345678
 *
 * systemeIoNewsletterEndpoint : URL HTTPS de VOTRE endpoint serveur qui
 * reçoit l'inscription puis dialogue avec l'API publique systeme.io.
 * Exemple : /api/newsletter.php
 *
 * IMPORTANT : ne placez jamais votre clé API systeme.io dans ce fichier.
 * La clé X-API-Key doit rester uniquement côté serveur.
 */
window.SYNUMANUS_CONFIG = {
  whatsappPhone: '33638052351',
  whatsappMessage: 'Bonjour Synumanus, j’aimerais discuter d’un projet',
  systemeIoNewsletterEndpoint: '/api/newsletter.php',
  projectEndpoint: '/api/project.php',
  projectPresenceEndpoint: '/api/project-presence.php',

  // URL publique "Calendrier" systeme.io
  systemeIoCalendarUrl: 'https://studio.synumanus.fr/discovery-call-calendar',

  // À configurer aussi comme redirection personnalisée de l'étape
  // « Thank You » du calendrier systeme.io.
  systemeIoBookingConfirmationUrl: '/'
};
