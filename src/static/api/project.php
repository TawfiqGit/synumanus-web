<?php
declare(strict_types=1);

require_once __DIR__ . '/_project_state.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$method = synumanusRequestMethod();
$localMock = synumanusIsLocalMock();

if ($method !== 'POST' && !($localMock && $method === 'GET')) {
    header('Allow: POST');
    respond(405, ['ok' => false, 'message' => 'Méthode non autorisée.']);
}

try {
    $payload = synumanusReadRequestPayload();
} catch (InvalidArgumentException $error) {
    respond(400, ['ok' => false, 'message' => $error->getMessage()]);
}

// Honeypot anti-spam : les humains ne voient jamais ce champ.
if (!empty($payload['website'])) {
    respond(200, ['ok' => true]);
}

$allowed = ['projectType', 'maturity', 'businessProblem', 'budget', 'startWindow', 'targetDate', 'company', 'lastName', 'firstName', 'email', 'phone'];
foreach ($allowed as $key) {
    if (isset($payload[$key]) && !is_string($payload[$key])) {
        respond(422, ['ok' => false, 'message' => 'Format de champ invalide.']);
    }
}
$token = $payload['submissionToken'] ?? bin2hex(random_bytes(32));
$tab = $payload['tabId'] ?? bin2hex(random_bytes(32));
if (!projectTokenValid($token) || !projectTokenValid($tab)) {
    respond(422, ['ok' => false, 'message' => 'Identifiant de demande invalide.']);
}
$payload = array_intersect_key($payload, array_flip($allowed));

$required = [
    'projectType' => 'nature du projet',
    'maturity' => 'niveau de maturité',
    'businessProblem' => 'problème métier',
    'budget' => 'budget',
    'lastName' => 'nom',
    'firstName' => 'prénom',
    'email' => 'email',
    'phone' => 'téléphone',
];

foreach ($required as $key => $label) {
    if (!isset($payload[$key]) || trim((string)$payload[$key]) === '') {
        respond(422, ['message' => "Le champ {$label} est obligatoire."]);
    }
}


// Le besoin doit être décrit en au moins 20 caractères (B3 / B6 AC-11.2, même règle que le navigateur).
if (synumanusTextLength(trim((string)$payload['businessProblem'])) < 20) {
    respond(422, ['message' => 'Décrivez votre besoin en quelques phrases (20 caractères minimum).']);
}

$email = filter_var(trim((string)$payload['email']), FILTER_VALIDATE_EMAIL);
if ($email === false) {
    respond(422, ['message' => 'Adresse email invalide.']);
}

$limits = [
    'lastName' => 100,
    'firstName' => 100,
    'company' => 160,
    'email' => 180,
    'phone' => 40,
    'businessProblem' => 1800,
    'targetDate' => 120,
    'projectType' => 120,
    'maturity' => 120,
    'budget' => 120,
    'startWindow' => 120,
];
foreach ($limits as $key => $max) {
    if (isset($payload[$key]) && synumanusTextLength((string)$payload[$key]) > $max) {
        respond(422, ['message' => "Le champ {$key} est trop long."]);
    }
}


$payload['email'] = strtolower((string)$email);
try {
    $record = projectRecord(projectDatabase(), $payload, $token, $tab, time());
} catch (Throwable $error) {
    error_log('Project persistence: ' . get_class($error));
    respond(503, ['ok' => false, 'message' => 'L’enregistrement a échoué. Veuillez réessayer.']);
}
$result = [
    'ok' => true, 'trackingToken' => $token,
    'appointment_booked' => (bool)$record['appointment_booked'],
    'relance_started' => (bool)$record['relance_started'],
];
if ($localMock) {
    if ($record['created']) synumanusLogLocalRequest('project', $payload);
    respond(200, $result + ['mock' => true]);
}
if (!$record['created']) respond(200, $result);

$recipient = getenv('SYNUMANUS_PROJECT_RECIPIENT') ?: 'contact@synumanus.fr';
$from = getenv('SYNUMANUS_PROJECT_FROM') ?: 'site@synumanus.fr';
$subject = 'Nouvelle demande projet — ' . cleanHeader((string)$payload['firstName'] . ' ' . (string)$payload['lastName']);
if (!empty($payload['company'])) {
    $subject .= ' — ' . cleanHeader((string)$payload['company']);
}

$message = buildProjectMessage($payload);
$headers = [
    'From: Synumanus Site <' . cleanHeader($from) . '>',
    'Reply-To: ' . cleanHeader((string)$email),
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = @mail($recipient, $subject, $message, implode("\r\n", $headers));
if (!$sent) {
    error_log('Synumanus project form: mail() failed. Configure the hosting mail transport or replace api/project.php with your preferred transactional email/webhook service.');
    // La demande est déjà durablement enregistrée : ne pas créer de doublon à la prochaine tentative.
}

respond(200, $result);

/**
 * cleanHeader(string $value): string
 * Supprime les retours ligne pour éviter l'injection d'en-têtes email.
 */
function cleanHeader(string $value): string
{
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

/**
 * scalarOrList(mixed $value): string
 * Transforme une valeur simple ou un tableau en texte lisible.
 */
function scalarOrList(mixed $value): string
{
    if (is_array($value)) {
        return implode(', ', array_map(static fn($item) => trim((string)$item), $value));
    }
    return trim((string)($value ?? ''));
}

/**
 * buildProjectMessage(array $payload): string
 * Construit le message texte reçu par Synumanus.
 */
function buildProjectMessage(array $payload): string
{
    $rows = [
        ['Type de projet', scalarOrList($payload['projectType'] ?? '')],
        ['Maturité', scalarOrList($payload['maturity'] ?? '')],
        ['Problème métier', scalarOrList($payload['businessProblem'] ?? '')],
        ['Budget', scalarOrList($payload['budget'] ?? '')],
        ['Démarrage', scalarOrList($payload['startWindow'] ?? '')],
        ['Échéance', scalarOrList($payload['targetDate'] ?? '')],
        ['Entreprise / projet', scalarOrList($payload['company'] ?? '')],
        ['Nom', scalarOrList($payload['lastName'] ?? '')],
        ['Prénom', scalarOrList($payload['firstName'] ?? '')],
        ['Email', scalarOrList($payload['email'] ?? '')],
        ['Téléphone', scalarOrList($payload['phone'] ?? '')],
    ];

    $lines = [
        'NOUVELLE DEMANDE PROJET — SYNUMANUS',
        str_repeat('=', 42),
        '',
    ];
    foreach ($rows as [$label, $value]) {
        if ($value !== '') {
            $lines[] = $label . ' :';
            $lines[] = $value;
            $lines[] = '';
        }
    }
    $lines[] = 'Source : formulaire Démarrer un projet';
    return implode("\n", $lines);
}

/**
 * respond(int $status, array $payload): never
 * Retourne une réponse JSON et termine l'exécution.
 */
function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
