<?php
/** Termine une simulation navigateur sur une base mock isolée. Aucun accès réseau. */
declare(strict_types=1);
if (PHP_SAPI !== 'cli' || count($argv) !== 2 || !is_file($argv[1])) {
    fwrite(STDERR, "Usage: php tests/simulate-booking-confirmation.php /chemin/base-mock.sqlite\n");
    exit(1);
}
putenv('SYNUMANUS_LOCAL_MOCK=1');
putenv('SYNUMANUS_PROJECT_DSN=');
putenv('SYNUMANUS_PROJECT_DB=' . realpath($argv[1]));
require_once dirname(__DIR__) . '/src/static/api/_project_worker.php';
class BookingSimulationApi extends ProjectCampaign {
    public int $reads = 0;
    public function request(string $method, string $path, ?array $body = null): array {
        throw new RuntimeException('Tout appel réseau est interdit dans cette simulation.');
    }
    public function tagId(string $name): int {
        if ($name !== 'appointment-valid') throw new RuntimeException('Aucune relance attendue.');
        return 1;
    }
    public function contact(string $email): ?array {
        $this->reads++;
        echo "[API SIMULÉE] Lecture du contact : tag appointment-valid présent.\n";
        return ['id' => 42, 'tags' => [['id' => 1, 'name' => 'appointment-valid']]];
    }
    public function sync(array $payload, ?array $contact): array { throw new RuntimeException('Envoi inattendu.'); }
    public function addTag(int $contactId, int $tagId): void { throw new RuntimeException('Relance inattendue.'); }
}
function verifySimulation(bool $ok, string $message): void {
    if (!$ok) throw new RuntimeException($message);
}
$db = projectDatabase();
$leads = $db->query('SELECT * FROM prospects')->fetchAll();
verifySimulation(count($leads) === 1, 'La base doit contenir uniquement le prospect de simulation.');
$lead = $leads[0];
$data = json_decode($lead['payload'], true, 512, JSON_THROW_ON_ERROR);
verifySimulation(($data['email'] ?? '') === 'simulation@example.invalid', 'Prospect de test attendu.');
verifySimulation(!(bool)$lead['appointment_booked'] && !(bool)$lead['relance_started'], 'État initial incorrect.');
$departure = $db->query('SELECT MAX(left_at) FROM project_visits')->fetchColumn();
verifySimulation($departure !== null, 'Le navigateur doit avoir signalé son départ.');
echo "[BASE] Prospect fictif enregistré : appointment_booked=false ; relance_started=false.\n";
echo "[NAVIGATEUR] Départ reçu : " . gmdate('c', (int)$departure) . ".\n";
$api = new BookingSimulationApi();
$before = projectProcessPending($db, $api, static fn() => (int)$departure + 899);
verifySimulation($api->reads === 0 && $before['errors'] === 0, 'Vérification trop précoce.');
echo "[DÉPART + 14 min 59 s — HORLOGE SIMULÉE] Aucun appel API, aucune relance.\n";
$result = projectProcessPending($db, $api, static fn() => (int)$departure + 900);
$state = $db->query('SELECT appointment_booked,relance_started,reminder_sent_at FROM prospects')->fetch();
verifySimulation($result['booked'] === 1 && $result['errors'] === 0, 'Confirmation non traitée.');
verifySimulation((bool)$state['appointment_booked'] && !(bool)$state['relance_started'] && $state['reminder_sent_at'] === null, 'État final incorrect.');
echo "[DÉPART + 15 min — HORLOGE SIMULÉE] appointment_booked=true ; relance_started=false.\n";
$again = projectProcessPending($db, $api, static fn() => (int)$departure + 960);
verifySimulation($api->reads === 1 && $again['booked'] === 0 && $again['reminded'] === 0, 'Double traitement.');
echo "[RÉSULTAT] SUCCÈS — aucune relance, aucun double traitement, aucune réservation réelle.\n";
