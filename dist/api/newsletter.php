<?php
/**
 * Endpoint Newsletter Synumanus -> systeme.io
 *
 * Signature HTTP production :
 * POST /api/newsletter.php
 *
 * Test local (SYNUMANUS_LOCAL_MOCK=1) :
 * GET ou POST /api/newsletter.php
 * Content-Type: application/json
 * Body: { "email": string, "consent": true, "source": "synumanus-homepage" }
 *
 * Variables d'environnement obligatoires :
 * - SYSTEMEIO_API_KEY : clé API secrète systeme.io, exclusivement côté serveur
 * - SYSTEMEIO_NEWSLETTER_TAG_ID : identifiant numérique du tag newsletter
 *
 * Prérequis : PHP 8.1+ avec extension cURL.
 */

declare(strict_types=1);

require_once __DIR__ . '/_request.php';

const SYSTEMEIO_API_BASE = 'https://api.systeme.io/api';

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

$email = strtolower(trim((string) ($payload['email'] ?? '')));
$consent = synumanusBool($payload['consent'] ?? false);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'message' => 'Adresse email invalide.']);
}

if ($consent !== true) {
    respond(422, ['ok' => false, 'message' => 'Le consentement est requis.']);
}

if ($localMock) {
    synumanusLogLocalRequest('newsletter', $payload);
    respond(200, [
        'ok' => true,
        'mock' => true,
        'message' => 'Inscription newsletter simulée localement.',
    ]);
}

$apiKey = trim((string) getenv('SYSTEMEIO_API_KEY'));
$tagIdRaw = trim((string) getenv('SYSTEMEIO_NEWSLETTER_TAG_ID'));

if ($apiKey === '' || $tagIdRaw === '' || !ctype_digit($tagIdRaw)) {
    error_log('Newsletter systeme.io: configuration serveur incomplète.');
    respond(500, ['ok' => false, 'message' => 'Configuration newsletter indisponible.']);
}

$tagId = (int) $tagIdRaw;

try {
    $contact = findContactByEmail($apiKey, $email);

    if ($contact === null) {
        $contact = createContact($apiKey, $email);
    }

    $contactId = (int) ($contact['id'] ?? 0);
    if ($contactId <= 0) {
        throw new RuntimeException('Identifiant contact systeme.io manquant.');
    }

    if (!contactHasTag($contact, $tagId)) {
        assignTagToContact($apiKey, $contactId, $tagId);
    }

    respond(200, [
        'ok' => true,
        'message' => 'Inscription enregistrée.',
    ]);
} catch (Throwable $error) {
    error_log('Newsletter systeme.io: ' . $error->getMessage());
    respond(502, [
        'ok' => false,
        'message' => 'Impossible d’enregistrer l’inscription pour le moment.',
    ]);
}

/**
 * findContactByEmail(string $apiKey, string $email): ?array
 * Recherche un contact systeme.io par adresse email exacte.
 */
function findContactByEmail(string $apiKey, string $email): ?array
{
    $query = http_build_query([
        'email' => $email,
        'limit' => 10,
    ]);

    $response = systemeIoRequest($apiKey, 'GET', '/contacts?' . $query);
    $items = $response['body']['items'] ?? [];

    if (!is_array($items) || $items === []) {
        return null;
    }

    foreach ($items as $item) {
        if (is_array($item) && strtolower((string) ($item['email'] ?? '')) === $email) {
            return $item;
        }
    }

    return null;
}

/**
 * createContact(string $apiKey, string $email): array
 * Crée le contact dans systeme.io.
 */
function createContact(string $apiKey, string $email): array
{
    $response = systemeIoRequest(
        $apiKey,
        'POST',
        '/contacts',
        [
            'email' => $email,
            'locale' => 'fr',
        ],
        [201]
    );

    return $response['body'];
}

/**
 * contactHasTag(array $contact, int $tagId): bool
 * Vérifie si le contact contient déjà le tag newsletter.
 */
function contactHasTag(array $contact, int $tagId): bool
{
    $tags = $contact['tags'] ?? [];
    if (!is_array($tags)) {
        return false;
    }

    foreach ($tags as $tag) {
        if (is_array($tag) && (int) ($tag['id'] ?? 0) === $tagId) {
            return true;
        }
    }

    return false;
}

/**
 * assignTagToContact(string $apiKey, int $contactId, int $tagId): void
 * Attribue le tag newsletter au contact systeme.io.
 */
function assignTagToContact(string $apiKey, int $contactId, int $tagId): void
{
    systemeIoRequest(
        $apiKey,
        'POST',
        "/contacts/{$contactId}/tags",
        ['tagId' => $tagId],
        [200, 201, 204]
    );
}

/**
 * systemeIoRequest(
 *   string $apiKey,
 *   string $method,
 *   string $path,
 *   ?array $body = null,
 *   array $acceptedStatuses = [200]
 * ): array{status:int, body:array<string,mixed>}
 *
 * Exécute une requête REST authentifiée vers systeme.io.
 */
function systemeIoRequest(
    string $apiKey,
    string $method,
    string $path,
    ?array $body = null,
    array $acceptedStatuses = [200]
): array {
    if (!function_exists('curl_init')) {
        throw new RuntimeException('Extension PHP cURL absente.');
    }

    $curl = curl_init(SYSTEMEIO_API_BASE . $path);
    if ($curl === false) {
        throw new RuntimeException('Impossible d’initialiser cURL.');
    }

    $headers = [
        'Accept: application/json',
        'X-API-Key: ' . $apiKey,
    ];

    $options = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_HTTPHEADER => $headers,
    ];

    if ($body !== null) {
        $encodedBody = json_encode($body, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        $headers[] = 'Content-Type: application/json';
        $options[CURLOPT_HTTPHEADER] = $headers;
        $options[CURLOPT_POSTFIELDS] = $encodedBody;
    }

    curl_setopt_array($curl, $options);
    $rawResponse = curl_exec($curl);

    if ($rawResponse === false) {
        $message = curl_error($curl);
        curl_close($curl);
        throw new RuntimeException('Erreur réseau systeme.io: ' . $message);
    }

    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);

    $decoded = [];
    if (trim((string) $rawResponse) !== '') {
        try {
            $candidate = json_decode((string) $rawResponse, true, 512, JSON_THROW_ON_ERROR);
            if (is_array($candidate)) {
                $decoded = $candidate;
            }
        } catch (JsonException) {
            $decoded = [];
        }
    }

    if (!in_array($status, $acceptedStatuses, true)) {
        $details = isset($decoded['message']) ? (string) $decoded['message'] : 'réponse API inattendue';
        throw new RuntimeException("systeme.io HTTP {$status}: {$details}");
    }

    return [
        'status' => $status,
        'body' => $decoded,
    ];
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
