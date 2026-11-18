<?php
declare(strict_types=1);
require_once __DIR__ . '/_project_state.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function presenceResponse(int $status, array $data): never {
    http_response_code($status);
    echo json_encode($data);
    exit;
}
if (synumanusRequestMethod() !== 'POST') {
    header('Allow: POST');
    presenceResponse(405, ['ok' => false]);
}
try {
    $payload = synumanusReadRequestPayload();
    if (!projectTokenValid($payload['token'] ?? null) || !projectTokenValid($payload['tabId'] ?? null)
        || !in_array($payload['event'] ?? '', ['present', 'leave'], true)) {
        presenceResponse(422, ['ok' => false]);
    }
    $db = projectDatabase();
    $find = $db->prepare('SELECT id,appointment_booked,relance_started FROM prospects WHERE token_hash=?');
    $find->execute([hash('sha256', $payload['token'])]);
    $row = $find->fetch();
    if (!$row) presenceResponse(404, ['ok' => false]);
    projectVisit($db, (int)$row['id'], $payload['tabId'], $payload['event'], time());
    presenceResponse(200, ['ok' => true, 'appointment_booked' => (bool)$row['appointment_booked']]);
} catch (InvalidArgumentException) {
    presenceResponse(400, ['ok' => false]);
} catch (Throwable $error) {
    error_log('Project presence: ' . get_class($error));
    presenceResponse(503, ['ok' => false]);
}
