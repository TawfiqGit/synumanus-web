"""Integration checks against an explicitly isolated mock PHP server."""
import argparse
import secrets
from test_local_api import request_json


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default='http://127.0.0.1:8093')
    base = parser.parse_args().base_url.rstrip('/')
    # Refuse to submit a lead unless the server is confirmed to be mocked.
    status, info = request_json(base + '/api/newsletter.php?email=probe%40example.invalid&consent=true')
    assert status == 200 and info.get('mock') is True, 'Mock server required'
    token, tab = secrets.token_hex(32), secrets.token_hex(32)
    payload = dict(projectType='Cadrage', maturity='Idée', businessProblem='Test isolé : description de besoin fictive',
                   budget='7 000 à 10 000 € HT', firstName='Test', lastName='Local',
                   email='project-test@example.invalid', phone='0600000000',
                   submissionToken=token, tabId=tab)
    status, _ = request_json(base + '/api/project.php', 'POST', {**payload, 'phone': ''})
    assert status == 422
    status, _ = request_json(base + '/api/project.php', 'POST', {**payload, 'email': ['bad']})
    assert status == 422
    for _ in range(2):
        status, result = request_json(base + '/api/project.php', 'POST', payload)
        assert status == 200 and result['trackingToken'] == token
        assert result['appointment_booked'] is False and result['relance_started'] is False
    endpoint = base + '/api/project-presence.php'
    status, _ = request_json(endpoint)
    assert status == 405
    status, _ = request_json(endpoint, 'POST', dict(token=secrets.token_hex(32), tabId=tab, event='present'))
    assert status == 404
    status, _ = request_json(endpoint, 'POST', dict(token=token, tabId=tab, event='booked'))
    assert status == 422
    for event in ['present', 'leave', 'present']:
        status, result = request_json(endpoint, 'POST', dict(token=token, tabId=tab, event=event))
        assert status == 200 and result['ok'] is True and result['appointment_booked'] is False
    print('OK: API validation, idempotent submission, initial flags, authenticated presence, leave/return.')


if __name__ == '__main__':
    main()
