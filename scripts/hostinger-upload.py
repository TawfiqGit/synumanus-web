#!/usr/bin/env python3
"""Dragon — envoi vers Hostinger. Le fichier auth (url, auth_key, rest_auth_key) vient de
hosting_files_generate-upload-url (connecteur Hostinger) ; il est temporaire et ne va JAMAIS dans le dépôt.
Envoi de fichiers vers Hostinger (TUS 1.0.0) : python3 tus-upload.py <auth.json> <src_dir> <dest_prefix> [fichiers ordonnés…]"""
import json, subprocess, sys
from pathlib import Path
auth = json.load(open(sys.argv[1])); src = Path(sys.argv[2]); prefix = sys.argv[3].strip('/')
files = [src / f for f in sys.argv[4:]] if len(sys.argv) > 4 else sorted(p for p in src.rglob('*') if p.is_file())
H = ['-H', f"X-Auth: {auth['auth_key']}", '-H', f"X-Auth-Rest: {auth['rest_auth_key']}", '-H', 'Tus-Resumable: 1.0.0']
ok = 0
for f in files:
    rel = f.relative_to(src).as_posix(); dest = f"{auth['url']}/{prefix}/{rel}?override=true"; size = f.stat().st_size
    c = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST', dest, *H, '-H', f'Upload-Length: {size}', '-H', 'Upload-Offset: 0'], capture_output=True, text=True).stdout
    if size:
        u = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'PATCH', dest, *H, '-H', 'Content-Type: application/offset+octet-stream', '-H', 'Upload-Offset: 0', '--data-binary', f'@{f}'], capture_output=True, text=True).stdout
    else:
        u = '204'
    good = c in ('200', '201') and u in ('200', '204')
    ok += good
    if not good: print(f'KO {prefix}/{rel} create={c} patch={u}')
print(f'{ok}/{len(files)} fichiers envoyés vers {prefix}/')
sys.exit(0 if ok == len(files) else 1)
