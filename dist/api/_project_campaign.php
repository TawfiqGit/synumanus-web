<?php
declare(strict_types=1);
require_once __DIR__ . '/_request.php';

class ProjectApiError extends RuntimeException {
    public function __construct(public int $status, public int $retryAfter = 60) {
        parent::__construct('Systeme.io HTTP ' . $status);
    }
}

class ProjectCampaign
{
    private ?array $fields = null;
    public function request(string $method, string $path, ?array $body = null): array
    {
        $key = trim((string)getenv('SYSTEMEIO_API_KEY'));
        if ($key === '') throw new RuntimeException('Clé Systeme.io manquante.');
        $curl = curl_init('https://api.systeme.io/api' . $path);
        $retryAfter = 60;
        $headers = ['Accept: application/json', 'X-API-Key: ' . $key];
        if ($body !== null) $headers[] = 'Content-Type: ' . ($method === 'PATCH' ? 'application/merge-patch+json' : 'application/json');
        $options = [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 15, CURLOPT_HTTPHEADER => $headers,
            CURLOPT_HEADERFUNCTION => static function ($curl, $line) use (&$retryAfter) {
                if (stripos($line, 'Retry-After:') === 0) {
                    $value = trim(substr($line, 12));
                    $retryAfter = ctype_digit($value) ? (int)$value : max(60, (strtotime($value) ?: time()) - time());
                }
                return strlen($line);
            }];
        if ($body !== null) $options[CURLOPT_POSTFIELDS] = json_encode($body, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        curl_setopt_array($curl, $options);
        $raw = curl_exec($curl);
        $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);
        if ($raw === false || $status < 200 || $status >= 300) throw new ProjectApiError($status, $retryAfter);
        if ($status === 204) return [];
        $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($data)) throw new RuntimeException('Réponse Systeme.io invalide.');
        return $data;
    }

    public function tagId(string $name): int
    {
        $cursor = null;
        do {
            $query = ['query' => $name, 'limit' => 100, 'order' => 'asc'];
            if ($cursor !== null) $query['startingAfter'] = $cursor;
            $page = $this->request('GET', '/tags?' . http_build_query($query));
            if (!isset($page['items']) || !is_array($page['items'])) throw new RuntimeException('Liste des tags invalide.');
            foreach ($page['items'] as $tag) {
                if (($tag['name'] ?? '') === $name && (int)($tag['id'] ?? 0) > 0) return (int)$tag['id'];
            }
            $last = end($page['items']);
            $next = $last['id'] ?? null;
            if (!empty($page['hasMore']) && (!$next || $next === $cursor)) throw new RuntimeException('Pagination des tags invalide.');
            $cursor = $next;
        } while (!empty($page['hasMore']));
        // Un tag de validation absent ne prouve pas l'absence de réservation.
        throw new RuntimeException('Tag requis absent : ' . $name);
    }

    public function contact(string $email): ?array
    {
        $page = $this->request('GET', '/contacts?' . http_build_query(['email' => $email, 'limit' => 10]));
        if (!isset($page['items']) || !is_array($page['items'])) throw new RuntimeException('Liste des contacts invalide.');
        foreach ($page['items'] as $contact) {
            if (strtolower($contact['email'] ?? '') === strtolower($email)) {
                return $this->fullContact((int)$contact['id']);
            }
        }
        if (!empty($page['hasMore']) || $page['items'] !== []) throw new RuntimeException('Recherche contact ambiguë.');
        return null;
    }

    public function fullContact(int $id): array
    {
        $contact = $this->request('GET', '/contacts/' . $id);
        if (empty($contact['id']) || !isset($contact['tags']) || !is_array($contact['tags'])) {
            throw new RuntimeException('Contact ou tags incomplets.');
        }
        return $contact;
    }

    public function hasTag(?array $contact, int $id): bool
    {
        foreach ($contact['tags'] ?? [] as $tag) {
            if ((int)($tag['id'] ?? 0) === $id) return true;
        }
        return false;
    }

    public static function fieldMap(): array
    {
        return ['firstName' => 'first_name', 'lastName' => 'last_name', 'phone' => 'phone_number',
            'company' => 'synumanus_company', 'projectType' => 'synumanus_project_type',
            'maturity' => 'synumanus_maturity', 'businessProblem' => 'synumanus_business_problem',
            'budget' => 'synumanus_budget', 'startWindow' => 'synumanus_start_window', 'targetDate' => 'synumanus_target_date'];
    }

    public function checkFields(): void
    {
        if ($this->fields !== null) return;
        $response = $this->request('GET', '/contact_fields');
        // Cette ressource retourne une liste simple, contrairement aux contacts paginés.
        $items = $response['items'] ?? $response;
        $slugs = array_column($items, 'slug');
        foreach (self::fieldMap() as $slug) {
            if (!in_array($slug, $slugs, true)) throw new RuntimeException('Champ Systeme.io absent : ' . $slug);
        }
        $this->fields = $slugs;
    }

    public function sync(array $payload, ?array $contact): array
    {
        $this->checkFields();
        $fields = [];
        foreach (self::fieldMap() as $key => $slug) {
            if (isset($payload[$key]) && $payload[$key] !== '') $fields[] = ['slug' => $slug, 'value' => $payload[$key]];
        }
        if ($contact) {
            $this->request('PATCH', '/contacts/' . (int)$contact['id'], ['fields' => $fields]);
            return $this->fullContact((int)$contact['id']);
        }
        try {
            $created = $this->request('POST', '/contacts', ['email' => $payload['email'], 'locale' => 'fr', 'fields' => $fields]);
        } catch (ProjectApiError $error) {
            // Une création concurrente (calendrier/newsletter) peut précéder notre requête.
            if (!in_array($error->status, [409, 422], true)) throw $error;
            $existing = $this->contact($payload['email']);
            if (!$existing) throw $error;
            return $this->sync($payload, $existing);
        }
        if (empty($created['id'])) throw new RuntimeException('Identifiant contact absent.');
        return $this->fullContact((int)$created['id']);
    }

    public function addTag(int $contactId, int $tagId): void
    {
        $this->request('POST', '/contacts/' . $contactId . '/tags', ['tagId' => $tagId]);
    }
}

class MockProjectCampaign extends ProjectCampaign
{
    public function tagId(string $name): int { return $name === 'appointment-valid' ? 1 : 2; }
    public function contact(string $email): ?array { return null; }
    public function checkFields(): void {}
    public function sync(array $payload, ?array $contact): array {
        synumanusLogLocalRequest('project-reminder-contact', $payload);
        return ['id' => 1, 'tags' => []];
    }
    public function fullContact(int $id): array { return ['id' => $id, 'tags' => []]; }
    public function addTag(int $contactId, int $tagId): void {
        synumanusLogLocalRequest('project-reminder-tag', ['tag' => 'appointment-reminder']);
    }
}
