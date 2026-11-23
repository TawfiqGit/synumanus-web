#!/usr/bin/env python3
"""Serveur local Synumanus pour tester le site + endpoints PHP GET/POST.

Pourquoi ce script existe :
- ``python -m http.server`` sert les fichiers statiques mais n'exécute pas PHP ;
- le serveur PHP intégré exécute correctement ``/api/*.php`` ;
- en mode mock local, les formulaires répondent sans contacter systeme.io ni mail() ;
- en mode mock local, ``local_router.php`` sert ``config.js`` sans le vrai calendrier
  systeme.io (condition de recette C1) : le calendrier simulé s'affiche à la place.

Le module ``cgi`` est importé en compatibilité avec les anciens environnements
Python <= 3.12. Il a été supprimé de la bibliothèque standard en Python 3.13,
d'où le ``try/except``. Le fonctionnement PHP de ce serveur n'en dépend pas.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys
import webbrowser

try:
    import cgi  # type: ignore[deprecated]  # Compatibilité Python <= 3.12 demandée.
except ModuleNotFoundError:  # Python 3.13+
    cgi = None  # type: ignore[assignment]

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
ROUTER = ROOT / "local_router.php"


def load_env_file(path: Path) -> None:
    """Charge un fichier .env simple sans dépendance externe."""
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            os.environ.setdefault(key, value)


def parse_args() -> argparse.Namespace:
    """Construit et parse les options CLI du serveur local."""
    parser = argparse.ArgumentParser(
        description="Serveur local Synumanus avec exécution PHP et mode mock API."
    )
    parser.add_argument("--host", default="127.0.0.1", help="Adresse d'écoute.")
    parser.add_argument("--port", type=int, default=8081, help="Port HTTP.")
    parser.add_argument(
        "--live",
        action="store_true",
        help="Désactive le mock local et appelle les intégrations réelles.",
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="N'ouvre pas automatiquement le navigateur.",
    )
    return parser.parse_args()


def ensure_php() -> str:
    """Retourne le chemin de PHP ou interrompt avec une erreur explicite."""
    php = shutil.which("php")
    if php is None:
        raise SystemExit(
            "PHP est introuvable. Installez PHP 8.1+ puis relancez : "
            "python3 local_server.py"
        )
    return php


def main() -> int:
    """Démarre le serveur PHP intégré avec le bon environnement local."""
    args = parse_args()
    php = ensure_php()

    if not DIST.exists():
        raise SystemExit(
            f"Le dossier {DIST} n'existe pas. Lancez d'abord : python3 build.py"
        )

    load_env_file(ROOT / ".env")

    env = os.environ.copy()
    env["SYNUMANUS_LOCAL_MOCK"] = "0" if args.live else "1"
    env.setdefault("SYNUMANUS_LOCAL_LOG", str(ROOT / "var" / "local-requests.log"))

    (ROOT / "var").mkdir(parents=True, exist_ok=True)

    url = f"http://{args.host}:{args.port}/"
    mode = "LIVE" if args.live else "MOCK LOCAL"

    print("=" * 68)
    print("Synumanus — serveur local de test")
    print(f"URL       : {url}")
    print(f"Document  : {DIST}")
    print(f"Mode API  : {mode}")
    print(f"Calendrier: {'RÉEL (systeme.io)' if args.live else 'simulé — C1, vrai calendrier désactivé'}")
    print(f"Log local : {env['SYNUMANUS_LOCAL_LOG']}")
    if cgi is None:
        print("CGI       : module cgi absent (normal sous Python 3.13+) — non requis")
    else:
        print("CGI       : import cgi disponible — compatibilité Python <= 3.12")
    print("Arrêt     : Ctrl+C")
    print("=" * 68)

    if not args.no_browser:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    command = [php, "-S", f"{args.host}:{args.port}", "-t", str(DIST), str(ROUTER)]
    try:
        return subprocess.call(command, cwd=str(ROOT), env=env)
    except KeyboardInterrupt:
        print("\nServeur arrêté.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
