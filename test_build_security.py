"""Vérifie que les secrets et leurs liens restent hors du build public."""
import re
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


    def test_preprod_uses_test_calendar_and_noindex(self):
        with tempfile.TemporaryDirectory() as directory:
            dist = Path(directory)
            (dist / 'config.js').write_text("x = { systemeIoCalendarUrl: '%s' };" % build.PROD_CALENDAR_URL, encoding='utf-8')
            (dist / '.htaccess').write_text('ErrorDocument 404 /404.html\n', encoding='utf-8')
            (dist / 'robots.txt').write_text('User-agent: *\nAllow: /\n', encoding='utf-8')
            with patch.object(build, 'DIST', dist):
                for bad in ('', 'http://exemple.fr/cal', build.PROD_CALENDAR_URL, 'https://systeme.io/dashboard/calendar/50250'):
                    with self.assertRaises(SystemExit):
                        build.apply_preprod(bad)
                self.assertIn(build.PROD_CALENDAR_URL, (dist / 'config.js').read_text())
                build.apply_preprod('https://studio.synumanus.fr/recette-calendar')
            self.assertIn("systemeIoCalendarUrl: 'https://studio.synumanus.fr/recette-calendar'", (dist / 'config.js').read_text())
            self.assertNotIn(build.PROD_CALENDAR_URL, (dist / 'config.js').read_text())
            self.assertIn('Disallow: /', (dist / 'robots.txt').read_text())
            self.assertIn('X-Robots-Tag "noindex, nofollow"', (dist / '.htaccess').read_text())

    def test_assets_are_versioned_by_content(self):
        with tempfile.TemporaryDirectory() as directory:
            dist = Path(directory)
            (dist / 'v2').mkdir()
            (dist / 'v2' / 'site.css').write_text('a{}', encoding='utf-8')
            (dist / 'config.js').write_text('x=1', encoding='utf-8')
            page = dist / 'index.html'
            page.write_text('<link href="/v2/site.css"><script src="/config.js"></script>'
                            '<script src="/absent.js"></script><a href="/page/">x</a>', encoding='utf-8')
            with patch.object(build, 'DIST', dist):
                build.version_assets()
                first = page.read_text()
                build.version_assets()
                self.assertEqual(first, page.read_text())  # idempotent
                (dist / 'config.js').write_text('x=2', encoding='utf-8')
                build.version_assets()
            second = page.read_text()
            self.assertRegex(first, r'href="/v2/site\.css\?v=[0-9a-f]{10}"')
            self.assertIn('src="/absent.js"', first)  # fichier absent : inchangé
            self.assertIn('href="/page/"', first)
            self.assertNotEqual(re.search(r'config\.js\?v=(\w+)', first).group(1),
                                re.search(r'config\.js\?v=(\w+)', second).group(1))

if __name__ == '__main__':
    unittest.main()
