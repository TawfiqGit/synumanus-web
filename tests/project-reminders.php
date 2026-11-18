<?php
declare(strict_types=1);
putenv('SYNUMANUS_LOCAL_MOCK=1');
putenv('SYNUMANUS_PROJECT_DSN=');
$dir = sys_get_temp_dir() . '/synumanus-test-' . bin2hex(random_bytes(8));
mkdir($dir, 0700);
putenv('SYNUMANUS_PROJECT_DB=' . $dir . '/prospects.sqlite');
require_once dirname(__DIR__) . '/src/static/api/_project_worker.php';
function check(bool $condition, string $message): void { if (!$condition) throw new RuntimeException($message); }
class TestCampaign extends MockProjectCampaign {
    public array $tags = [];
    public int $sent = 0;
    public int $syncs = 0;
    public bool $failRead = false;
    public bool $timeoutAfterTag = false;
    public bool $bookDuringSync = false;
    public $duringSync = null;
    public function contact(string $email): ?array {
        if ($this->failRead) throw new ProjectApiError(429, 180);
        return $this->fullContact(42);
    }
    public function sync(array $payload, ?array $contact): array {
        $this->syncs++;
        if ($this->duringSync) ($this->duringSync)();
        if ($this->bookDuringSync) $this->tags[] = ['id' => 1];
        return $this->fullContact(42);
    }
    public function fullContact(int $id): array { return ['id' => $id, 'tags' => $this->tags]; }
    public function addTag(int $contactId, int $tagId): void {
        $this->sent++;
        $this->tags[] = ['id' => $tagId];
        if ($this->timeoutAfterTag) { $this->timeoutAfterTag = false; throw new ProjectApiError(0); }
    }
}
$db = projectDatabase();
$payload = ['email' => 'test@example.invalid', 'businessProblem' => 'Test'];
$time = 100000;
$clock = static function () use (&$time) { return $time; };
$tab = str_repeat('a', 64);
$new = static function () use ($db, $payload, $tab, &$time) {
    $db->exec('DELETE FROM project_visits; DELETE FROM prospects;');
    return projectRecord($db, $payload, str_repeat('b', 64), $tab, $time);
};
try {
    $lead = $new(); $id = (int)$lead['id'];
    check(!(bool)$lead['appointment_booked'] && !(bool)$lead['relance_started'], 'Initial flags false');
    $again = projectRecord($db, $payload, str_repeat('b', 64), $tab, $time);
    check(!$again['created'] && $again['id'] === $lead['id'], 'Idempotent submission');
    $api = new TestCampaign();
    $time += 900;
    projectProcessPending($db, $api, $clock);
    check($api->sent === 0, 'Grace period before inferred departure');
    projectVisit($db, $id, $tab, 'leave', $time);
    $time += 899;
    projectProcessPending($db, $api, $clock);
    check($api->sent === 0, 'No reminder before 15 minutes');
    $time++;
    projectProcessPending($db, $api, $clock);
    check($api->sent === 1 && $api->syncs === 1, 'Absent tag sends data then reminder');
    check((int)$db->query('SELECT relance_started FROM prospects')->fetchColumn() === 1, 'Reminder flag persisted');
    projectProcessPending($db, $api, $clock);
    check($api->sent === 1, 'No repeated successful reminder');

    $lead = $new(); $id = (int)$lead['id']; $api = new TestCampaign(); $api->tags = [['id' => 1]];
    $time += 990;
    projectProcessPending($db, $api, $clock);
    check((int)$db->query('SELECT appointment_booked FROM prospects')->fetchColumn() === 1 && $api->sent === 0 && $api->syncs === 0, 'Valid appointment prevents reminder');

    $lead = $new(); $id = (int)$lead['id']; $api = new TestCampaign();
    projectVisit($db, $id, $tab, 'leave', $time);
    $time += 850;
    projectVisit($db, $id, $tab, 'present', $time);
    $time += 50;
    projectProcessPending($db, $api, $clock);
    check($api->sent === 0, 'Return cancels pending deadline');
    projectVisit($db, $id, str_repeat('c', 64), 'present', $time);
    projectVisit($db, $id, $tab, 'leave', $time);
    $time += 890;
    projectVisit($db, $id, str_repeat('c', 64), 'present', $time);
    $time += 10;
    projectProcessPending($db, $api, $clock);
    check($api->sent === 0, 'Second tab remains present');

    $lead = $new(); $api = new TestCampaign(); $api->failRead = true; $time += 990;
    projectProcessPending($db, $api, $clock);
    $row = $db->query('SELECT * FROM prospects')->fetch();
    check((int)$row['relance_started'] === 0 && (int)$row['appointment_booked'] === 0 && (int)$row['next_attempt_at'] === $time + 180, 'API error defers without classifying');
    $api->failRead = false; $api->timeoutAfterTag = true; $time += 180;
    projectProcessPending($db, $api, $clock);
    $time += 120;
    projectProcessPending($db, $api, $clock);
    check($api->sent === 1 && $db->query('SELECT reminder_sent_at FROM prospects')->fetchColumn() !== null, 'Timeout after tag does not duplicate tag');

    $lead = $new(); $api = new TestCampaign(); $api->bookDuringSync = true; $time += 990;
    projectProcessPending($db, $api, $clock);
    check($api->sent === 0 && (int)$db->query('SELECT appointment_booked FROM prospects')->fetchColumn() === 1, 'Late booking rechecked');

    $lead = $new(); $id = (int)$lead['id']; $api = new TestCampaign(); $time += 990;
    $api->duringSync = static function () use ($db, $id, $tab, &$time) { projectVisit($db, $id, $tab, 'present', $time); };
    projectProcessPending($db, $api, $clock);
    check($api->sent === 0, 'Return during sync prevents tag');
    echo "OK: persistence, idempotency, 15-minute delay, presence, multiple tabs, tags, API errors, retries, late booking.\n";
} finally {
    $db = null;
    foreach (glob($dir . '/*') as $file) unlink($file);
    rmdir($dir);
}
