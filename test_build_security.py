"""Vérifie que les secrets et leurs liens restent hors du build public."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import build


class BuildSecurityTests(unittest.TestCase):
    def test_static_copy_excludes_env_variants_and_symlinks(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            static = root / 'src' / 'static'
            static.mkdir(parents=True)
            (static / 'api').mkdir()
            for name in ('.env', '.env.example', '.env.backup', 'api/.env.production'):
                (static / name).write_text('SYSTEMEIO_API_KEY=secret-sentinel')
            (static / '.env.d').mkdir()
            (static / '.env.d' / 'secret.txt').write_text('secret-sentinel')
            (root / 'private').mkdir()
            (root / 'private' / 'secret.txt').write_text('secret-sentinel')
            (static / 'public.txt').symlink_to(root / 'private' / 'secret.txt')
            (static / 'linked').symlink_to(root / 'private', target_is_directory=True)
            (static / 'config.js').write_text('window.config = {};')
            (static / 'api' / 'newsletter.php').write_text('<?php // endpoint')
            dist = root / 'dist'
            with patch.object(build, 'SRC', root / 'src'), patch.object(build, 'DIST', dist):
                build.copy_static()
            files = {str(p.relative_to(dist)) for p in dist.rglob('*') if p.is_file()}
            self.assertEqual(files, {'config.js', 'api/newsletter.php'})
            self.assertTrue(all(b'secret-sentinel' not in p.read_bytes()
                                for p in dist.rglob('*') if p.is_file()))


if __name__ == '__main__':
    unittest.main()
