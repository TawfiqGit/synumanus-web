<?php
/**
 * Routeur du serveur local de test (php -S), utilisé par local_server.py.
 *
 * Condition de recette C1 (B6) : en mode mock, le formulaire ne doit jamais
 * afficher le vrai calendrier systeme.io (risque de réservation réelle et de
 * relances). Ce routeur sert donc /config.js avec systemeIoCalendarUrl vide :
 * project.js affiche alors le calendrier simulé (« Simuler la réservation »).
 *
 * - Le fichier publié (dist/config.js) n'est pas modifié : la production garde
 *   le vrai calendrier.
 * - Fermeture sûre : si le remplacement échoue, config.js n'est pas servi
 *   (erreur 500) plutôt que de laisser passer le vrai calendrier.
 * - Toutes les autres adresses sont servies normalement (return false).
 */
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

if ($path === '/config.js' && getenv('SYNUMANUS_LOCAL_MOCK') === '1') {
    $source = @file_get_contents(rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/config.js');
    $count = 0;
    $config = $source === false ? '' : preg_replace(
        "/systemeIoCalendarUrl:\\s*'[^']*'/",
        "systemeIoCalendarUrl: ''",
        $source,
        1,
        $count
    );
    if ($count !== 1) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo "C1 : impossible de neutraliser systemeIoCalendarUrl, config.js non servi.\n";
        return true;
    }
    header('Content-Type: application/javascript; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Synumanus-Test-Config: calendrier-simule');
    echo "/* Configuration de test (local_server.py, mode mock) : calendrier systeme.io désactivé (C1). */\n";
    echo $config;
    return true;
}

return false;
