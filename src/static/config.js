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

  // Après une réservation, systeme.io doit rediriger vers
  // https://www.synumanus.fr/demarrer-un-projet/?booking=confirmed (réglage « Thank You »
  // de la page calendrier) : project.js envoie alors vers la page de remerciement de la
  // campagne en cours, sinon vers /rendez-vous-confirme/.
  systemeIoBookingConfirmationUrl: '/rendez-vous-confirme/'
};
