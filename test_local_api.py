#!/usr/bin/env python3
"""Tests rapides GET/POST des endpoints Synumanus en mode mock local."""
from __future__ import annotations

import argparse
import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError


def request_json(url: str, method: str = "GET", payload: dict | None = None) -> tuple[int, dict]:
    """Exécute une requête HTTP et retourne (status, JSON)."""
    data = None
    headers = {"Accept": "application/json"}
    if payload is not None and method == "POST":
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req, timeout=5) as response:
            raw = response.read().decode("utf-8")
            try:
                body = json.loads(raw)
            except json.JSONDecodeError:
                body = {"ok": False, "raw": raw[:500]}
            return response.status, body
    except HTTPError as error:
        raw = error.read().decode("utf-8")
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            body = {"ok": False, "raw": raw[:500]}
        return error.code, body


def main() -> int:
    """Teste newsletter et projet en GET puis POST."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8080")
    args = parser.parse_args()
    base = args.base_url.rstrip("/")

    newsletter = {
        "email": "test-local@synumanus.fr",
        "consent": True,
        "source": "test-local",
    }
    project = {
        "projectType": "Nouvelle application",
        "maturity": "Besoin identifié",
        "businessProblem": "Test local du formulaire Synumanus.",
        "budget": "7 000 € HT et plus",
        "startWindow": "Dans le trimestre",
        "company": "Projet local",
        "lastName": "Dupont",
        "firstName": "Jean",
        "email": "jean.dupont@example.com",
        "phone": "0600000000",
    }

    tests = [
        ("Newsletter GET", "GET", f"{base}/api/newsletter.php?{urlencode(newsletter)}", None),
        ("Newsletter POST", "POST", f"{base}/api/newsletter.php", newsletter),
        ("Projet GET", "GET", f"{base}/api/project.php?{urlencode(project)}", None),
        ("Projet POST", "POST", f"{base}/api/project.php", project),
    ]

    failed = False
    for label, method, url, payload in tests:
        status, body = request_json(url, method, payload)
        ok = 200 <= status < 300 and bool(body.get("ok"))
        print(f"{'OK' if ok else 'ERREUR':7} {label:18} HTTP {status}  {body}")
        failed = failed or not ok

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
