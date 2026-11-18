<?php
/** Worker CLI uniquement. À exécuter toutes les minutes sur l'hébergement. */
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root = dirname(__DIR__);
$public = is_file($root . '/public_html/api/_project_worker.php') ? $root . '/public_html' : $root . '/dist';
require_once $public . '/api/_project_worker.php';
try {
    $db = projectDatabase();
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql') {
        // Verrou partagé entre tous les workers connectés à cette base.
        $lockName = 'synumanus-project-' . substr(hash('sha256', (string)$db->query('SELECT DATABASE()')->fetchColumn()), 0, 32);
        $lock = $db->prepare('SELECT GET_LOCK(?, 0)');
        $lock->execute([$lockName]);
        if ((int)$lock->fetchColumn() !== 1) exit(0);
    } else {
        $path = $db->query('PRAGMA database_list')->fetch()['file'];
        $lock = fopen($path . '.worker.lock', 'c');
        if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) exit(0);
    }
    $api = synumanusIsLocalMock() ? new MockProjectCampaign() : new ProjectCampaign();
    if (in_array('--configure-fields', $argv, true)) {
        if (synumanusIsLocalMock()) throw new RuntimeException('Configuration réservée au mode réel.');
        $response = $api->request('GET', '/contact_fields');
        $slugs = array_column($response['items'] ?? $response, 'slug');
        $labels = ['firstName' => 'Prénom', 'lastName' => 'Nom', 'phone' => 'Téléphone',
            'company' => 'Synumanus — Entreprise / projet', 'projectType' => 'Synumanus — Nature du projet',
            'maturity' => 'Synumanus — Maturité', 'businessProblem' => 'Synumanus — Besoin métier',
            'budget' => 'Synumanus — Budget', 'startWindow' => 'Synumanus — Démarrage', 'targetDate' => 'Synumanus — Échéance'];
        foreach (ProjectCampaign::fieldMap() as $key => $slug) {
            if (in_array($slug, $slugs, true)) continue;
            $api->request('POST', '/contact_fields', ['slug' => $slug, 'fieldName' => $labels[$key]]);
            echo 'Champ créé : ' . $slug . PHP_EOL;
        }
        $api->checkFields();
    } elseif (in_array('--check', $argv, true)) {
        $api->tagId('appointment-valid');
        $api->tagId('appointment-reminder');
        $api->checkFields();
        echo "Stockage, tags et champs disponibles.\n";
    } else {
        $stats = projectProcessPending($db, $api);
        echo json_encode($stats) . PHP_EOL;
        if ($stats['errors']) exit(1);
    }
} catch (Throwable $error) {
    fwrite(STDERR, 'Project worker: ' . $error->getMessage() . PHP_EOL);
    exit(1);
}
