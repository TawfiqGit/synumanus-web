<?php
declare(strict_types=1);
require_once __DIR__ . '/_project_state.php';
require_once __DIR__ . '/_project_campaign.php';

/** Exécuté par un seul worker à la fois (verrou CLI). Horloge injectable pour les tests. */
function projectProcessPending(PDO $db, ProjectCampaign $api, ?callable $clock = null): array
{
    $clock ??= static fn() => time();
    $stats = ['booked' => 0, 'reminded' => 0, 'deferred' => 0, 'errors' => 0];
    $query = $db->prepare('SELECT * FROM prospects WHERE appointment_booked=0 AND reminder_sent_at IS NULL AND next_attempt_at<=?
        AND id IN (SELECT prospect_id FROM project_visits GROUP BY prospect_id HAVING MAX(COALESCE(left_at,last_seen_at + ?)) + ? <= ?)
        ORDER BY next_attempt_at,id LIMIT 100');
    $query->execute([$clock(), PROJECT_PRESENCE_GRACE, PROJECT_REMINDER_DELAY, $clock()]);
    foreach ($query->fetchAll() as $lead) {
        $id = (int)$lead['id'];
        if (!projectDue($db, $id, $clock())) { $stats['deferred']++; continue; }
        try {
            $payload = json_decode($lead['payload'], true, 512, JSON_THROW_ON_ERROR);
            $validId = $api->tagId('appointment-valid');
            $contact = $api->contact($payload['email']);
            if ($api->hasTag($contact, $validId)) {
                projectMarkBooked($db, $id, (int)$contact['id']);
                $stats['booked']++;
                continue;
            }
            $reminderId = $api->tagId('appointment-reminder');
            $api->checkFields();
            if (!projectDue($db, $id, $clock())) { $stats['deferred']++; continue; }
            $db->prepare('UPDATE prospects SET relance_started=1 WHERE id=?')->execute([$id]);
            $contact = $api->sync($payload, $contact);
            $db->prepare('UPDATE prospects SET systeme_contact_id=? WHERE id=?')->execute([(int)$contact['id'], $id]);
            // Relecture après synchronisation : une réservation a pu être validée entretemps.
            $contact = $api->fullContact((int)$contact['id']);
            if ($api->hasTag($contact, $validId)) {
                projectMarkBooked($db, $id, (int)$contact['id']);
                $stats['booked']++;
                continue;
            }
            if (!projectDue($db, $id, $clock())) { $stats['deferred']++; continue; }
            // Après un timeout, relire le tag évite de redéclencher la même automation.
            if (!$api->hasTag($contact, $reminderId)) $api->addTag((int)$contact['id'], $reminderId);
            $db->prepare('UPDATE prospects SET reminder_sent_at=?,last_error=NULL WHERE id=?')->execute([$clock(), $id]);
            $stats['reminded']++;
        } catch (Throwable $error) {
            $attempts = (int)$lead['attempts'] + 1;
            $delay = min(3600, 60 * (2 ** min($attempts - 1, 6)));
            if ($error instanceof ProjectApiError) $delay = max($delay, $error->retryAfter);
            $message = $error instanceof RuntimeException ? $error->getMessage() : get_class($error);
            $db->prepare('UPDATE prospects SET attempts=?,next_attempt_at=?,last_error=? WHERE id=?')->execute([$attempts, $clock() + $delay, $message, $id]);
            error_log('Project worker prospect #' . $id . ': ' . $message);
            $stats['errors']++;
        }
    }
    return $stats;
}

function projectMarkBooked(PDO $db, int $id, int $contactId): void
{
    $db->prepare('UPDATE prospects SET appointment_booked=1,systeme_contact_id=?,last_error=NULL WHERE id=?')->execute([$contactId, $id]);
}
