#!/usr/bin/env python3
"""Générateur statique Synumanus — architecture finale à URLs dossiers."""
from pathlib import Path
import json, shutil, html, re

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'src'
DIST = ROOT / 'dist'
SITE = json.loads((SRC/'data/site.json').read_text(encoding='utf-8'))
BASE_URL = SITE['base_url'].rstrip('/')

BRAND_ICON = '<img class="brand-mark" src="/assets/v-dark.png" width="34" height="34" alt="" />'
CHEVRON_SVG = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
WHATSAPP_SVG = '<svg class="whatsapp-logo" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4.3a11.2 11.2 0 0 0-9.7 16.8L4.8 27l6-1.4A11.2 11.2 0 1 0 16 4.3Z" fill="currentColor"/><path d="M12.2 10.1c-.3-.7-.6-.7-.9-.7h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.2s1.4 3.8 1.6 4.1c.2.3 2.8 4.3 6.8 6 .9.4 1.7.6 2.2.8.9.3 1.8.3 2.5.2.8-.1 2.4-1 2.7-1.9.3-.9.3-1.7.2-1.9-.1-.2-.4-.3-.8-.5l-2.6-1.2c-.4-.2-.7-.3-1 .3-.3.4-1 1.2-1.2 1.5-.2.3-.5.3-.9.1-.4-.2-1.8-.7-3.4-2.1a12.6 12.6 0 0 1-2.3-2.8c-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7l-1.3-2.7Z" fill="#fff"/></svg>'

def read(path: Path) -> str:
    """Lit un fichier UTF-8."""
    return path.read_text(encoding='utf-8')

def replace_tokens(template: str, values: dict[str, str]) -> str:
    """Remplace les tokens {{TOKEN}} d'un template."""
    for key, value in values.items():
        template = template.replace('{{' + key + '}}', value)
    return template

def render_nav_items(items: list[dict], current_key: str | None, mobile: bool=False) -> str:
    """Construit les entrées desktop ou mobile d'un Hub."""
    out = []
    for item in items:
        current = ' is-current' if item['key'] == current_key else ''
        aria = ' aria-current="page"' if item['key'] == current_key else ''
        if mobile:
            out.append(f'<a class="mobile-hub-item{current}" href="{item["href"]}"{aria}><span>{item["number"]}</span><strong>{item["title"]}</strong></a>')
        else:
            out.append(f'<a class="nav-hub-item{current}" href="{item["href"]}"{aria}><span class="nav-hub-number">{item["number"]}</span><span class="nav-hub-copy"><strong>{item["title"]}</strong><small>{item["description"]}</small></span><span class="nav-hub-arrow" aria-hidden="true">→</span></a>')
    return ''.join(out)

def render_footer_items(items: list[dict]) -> str:
    """Construit les liens d'une colonne de footer."""
    return ''.join(f'<a href="{x["href"]}">{x["title"]}</a>' for x in items)

ARROW_SVG = '<svg class="icon-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def render_v2_menu(nav: dict, current_key: str | None, mobile: bool=False) -> str:
    """Construit le sous-menu « Solutions » (refonte v2) : 3 piliers + 4 services mobiles."""
    def link(item: dict, cls: str) -> str:
        is_current = item['key'] == current_key
        aria = ' aria-current="page"' if is_current else ''
        badge = f'<span class="tag tag-accent">{item["badge"]}</span>' if item.get('badge') and not mobile else ''
        desc = '' if mobile else f'<small>{item["description"]}</small>'
        return (f'<a class="{cls}{" is-current" if is_current else ""}" href="{item["href"]}"{aria}>'
                f'<span class="menu-link-title">{item["title"]}{badge}</span>{desc}</a>')
    pillars = ''.join(link(x, 'menu-link menu-link-pillar') for x in nav['pillars'])
    services = ''.join(link(x, 'menu-link') for x in nav['services'])
    return (f'<div class="menu-col"><p class="menu-label">Nos solutions</p>{pillars}</div>'
            f'<div class="menu-col"><p class="menu-label">Applications mobiles</p>{services}</div>')

def render_v2_footer_items(items: list[dict]) -> str:
    """Liens de colonne de footer (refonte v2)."""
    return ''.join(f'<li><a href="{x["href"]}">{x["title"]}</a></li>' for x in items)

def minify_css(css: str) -> str:
    """Minification prudente : commentaires retirés, espaces réduits (aucune réécriture de règle).
    Les sources n'ont pas de « /* » dans des chaînes, et les espaces utiles (calc, sélecteurs) sont conservés."""
    import re
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{};])\s*', r'\1', css)
    css = css.replace(';}', '}')
    return css.strip() + '\n'

def build_v2_css() -> None:
    """Lot 3 : /v2/site.css = ds.css + theme.css fusionnés et minifiés ; autres feuilles v2 minifiées."""
    v2 = DIST/'v2'
    merged = read(SRC/'static/v2/ds.css') + '\n' + read(SRC/'static/v2/theme.css')
    (v2/'site.css').write_text(minify_css(merged), encoding='utf-8')
    # Les sources fusionnées ne sont pas publiées (aucune page ne les charge).
    for source in ('ds.css', 'theme.css'):
        (v2/source).unlink(missing_ok=True)
    for name in ('home.css', 'demos.css', 'project.css'):
        path = v2/name
        if path.exists():
            path.write_text(minify_css(path.read_text(encoding='utf-8')), encoding='utf-8')

def copy_static() -> None:
    """Copie les assets et endpoints, jamais les fichiers d'environnement."""
    static = SRC/'static'
    for path in static.rglob('*'):
        relative = path.relative_to(static)
        if any(part.lower().startswith('.env') for part in relative.parts):
            continue
        # Un lien pourrait exposer un secret situé hors du dossier statique.
        if any((static / Path(*relative.parts[:index])).is_symlink()
               for index in range(1, len(relative.parts) + 1)):
            continue
        if not path.is_file():
            continue
        target = DIST/relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)

ORG_REF = {'@type': 'ProfessionalService', '@id': 'https://www.synumanus.fr/#organisation', 'name': 'Synumanus', 'url': 'https://www.synumanus.fr/'}

def plain_text(fragment: str) -> str:
    """Texte visible d'un fragment HTML : balises retirées, entités décodées, espaces normalisés."""
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', fragment)).split())

def build_v2_structured_data(meta: dict, content: str, canonical: str) -> str:
    """Lot 4 : JSON-LD généré depuis le contenu visible (FAQPage, BreadcrumbList, Service).

    Les nœuds écrits à la main dans pages.json (ex. ProfessionalService de l'accueil)
    sont conservés et fusionnés dans un seul @graph. Générer depuis le HTML garantit
    que les données structurées restent identiques au texte affiché.
    """
    graph = []
    manual = meta.get('structured_data')
    if manual:
        data = json.loads(manual)
        graph.extend(data.get('@graph', [data]))
        for node in graph:
            node.pop('@context', None)
    # Service : pages piliers et services (nom = titre avant « — »).
    if meta.get('service_key') or meta.get('pillar_key'):
        graph.append({
            '@type': 'Service',
            'name': meta['title'].split(' — ')[0].strip(),
            'description': meta['description'],
            'url': canonical,
            'provider': ORG_REF,
            'areaServed': {'@type': 'Country', 'name': 'France'},
        })
    # BreadcrumbList : depuis le fil d'Ariane ; un niveau sans lien (ex. « Solutions ») est ignoré.
    nav = re.search(r'<nav class="breadcrumb"[^>]*>(.*?)</nav>', content, re.S)
    if nav:
        items = []
        for li in re.findall(r'<li>(.*?)</li>', nav.group(1), re.S):
            link = re.search(r'<a href="([^"]+)"', li)
            current = 'aria-current="page"' in li
            if not link and not current:
                continue
            entry = {'@type': 'ListItem', 'position': len(items) + 1, 'name': plain_text(li)}
            entry['item'] = canonical if current else BASE_URL + link.group(1)
            items.append(entry)
        if len(items) > 1:
            graph.append({'@type': 'BreadcrumbList', 'itemListElement': items})
    # FAQPage : depuis les blocs <details class="faq-item">.
    faqs = re.findall(r'<details class="faq-item"[^>]*>\s*<summary>(.*?)</summary>\s*<div>(.*?)</div>\s*</details>', content, re.S)
    if faqs:
        graph.append({'@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': plain_text(q), 'acceptedAnswer': {'@type': 'Answer', 'text': plain_text(a)}}
            for q, a in faqs]})
    if not graph:
        return ''
    payload = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, indent=2)
    # « </ » échappé pour qu'aucun texte ne puisse fermer la balise script.
    payload = payload.replace('</', '<\\/')
    return '  <script type="application/ld+json">\n' + payload + '\n  </script>'

def build() -> None:
    """Génère toutes les pages, le sitemap et robots.txt."""
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    copy_static()
    build_v2_css()
    pages = json.loads(read(SRC/'data/pages.json'))
    nav = json.loads(read(SRC/'data/navigation.json'))
    base = read(SRC/'templates/base.html')
    header_tpl = read(SRC/'partials/header.html')
    footer_tpl = read(SRC/'partials/footer.html')
    whatsapp_tpl = read(SRC/'partials/whatsapp.html')
    base_v2 = read(SRC/'templates/base-v2.html')
    header_v2_tpl = read(SRC/'partials/header-v2.html')
    footer_v2_tpl = read(SRC/'partials/footer-v2.html')
    built_routes = []

    for output_rel, meta in pages.items():
        if meta.get('design') == 'v2':
            # Refonte v2 (Graphite × papier technique) : gabarit, header et footer dédiés.
            # Les pages du lot 2 gardent l'ancien design pendant la transition (décision B2 du 17/11).
            nav_key = meta.get('nav_key')
            in_solutions = bool(meta.get('service_key') or meta.get('pillar_key'))
            current = meta.get('service_key') or meta.get('pillar_key')
            header = replace_tokens(header_v2_tpl, {
                'BRAND_ICON': BRAND_ICON,
                'CHEVRON_SVG': CHEVRON_SVG,
                'ARROW_SVG': ARROW_SVG,
                'SOLUTIONS_CURRENT': ' is-current' if in_solutions else '',
                'AGENCE_ARIA': ' aria-current="page"' if nav_key == 'agence' else '',
                'SOLUTIONS_MENU': render_v2_menu(nav, current),
                'MOBILE_SOLUTIONS_MENU': render_v2_menu(nav, current, True),
            })
            footer = replace_tokens(footer_v2_tpl, {
                'BRAND_ICON': BRAND_ICON,
                'ARROW_SVG': ARROW_SVG,
                'FOOTER_PILLAR_ITEMS': render_v2_footer_items(nav['pillars']),
                'FOOTER_SERVICE_ITEMS': render_v2_footer_items(nav['services']),
                'FOOTER_SECTOR_ITEMS': render_v2_footer_items(nav['sectors']),
                'FOOTER_RESOURCE_ITEMS': render_v2_footer_items(nav['resources']),
            })
            whats = replace_tokens(whatsapp_tpl, {'WHATSAPP_SVG': WHATSAPP_SVG})
            content = read(SRC/'pages'/meta['source']).replace('{{CTA_BAND}}', read(SRC/'partials/cta-v2.html'))
            content = replace_tokens(content, {'ARROW_SVG': ARROW_SVG})
            structured = build_v2_structured_data(meta, content, BASE_URL + meta['route'])
            output = replace_tokens(base_v2, {
                'TITLE': html.escape(meta['title'], quote=False),
                'DESCRIPTION': html.escape(meta['description'], quote=True),
                'OG_TITLE': html.escape(meta['og_title'], quote=True),
                'OG_DESCRIPTION': html.escape(meta['og_description'], quote=True),
                'CANONICAL': BASE_URL + meta['route'],
                'EXTRA_STYLES': '\n'.join(f'  <link rel="stylesheet" href="/{s}" />' for s in meta.get('styles', [])),
                'STRUCTURED_DATA': structured,
                'BODY_CLASS': meta.get('body_class', ''),
                'ROBOTS': meta.get('robots', 'index,follow'),
                'HEADER': header,
                'CONTENT': content,
                'FOOTER': footer,
                'WHATSAPP': whats,
                'EXTRA_SCRIPTS': '\n'.join(f'  <script src="/{s}" defer></script>' for s in meta.get('scripts', [])),
            })
            target = DIST/output_rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(output, encoding='utf-8')
            # Une page peut être exclue du sitemap (ex. 404) avec "sitemap": false.
            if meta.get('sitemap', True):
                built_routes.append(meta['route'])
            continue

        service_key = meta.get('service_key')
        sector_key = meta.get('sector_key')
        resource_key = meta.get('resource_key')
        direct_key = meta.get('direct_key')
        header = replace_tokens(header_tpl, {
            'BRAND_ICON': BRAND_ICON,
            'CHEVRON_SVG': CHEVRON_SVG,
            'SERVICE_HUB_ACTIVE': ' is-current' if service_key else '',
            'SECTOR_HUB_ACTIVE': ' is-current' if sector_key else '',
            'RESOURCE_HUB_ACTIVE': ' is-current' if resource_key else '',
            'SERVICE_TRIGGER_ACTIVE': ' nav-active' if service_key else '',
            'SECTOR_TRIGGER_ACTIVE': ' nav-active' if sector_key else '',
            'RESOURCE_TRIGGER_ACTIVE': ' nav-active' if resource_key else '',
            'IA_ACTIVE': ' is-current' if direct_key == 'ia' else '',
            'ABOUT_ACTIVE': ' is-current' if direct_key == 'about' else '',
            'SERVICE_ITEMS': render_nav_items(nav['services'], service_key),
            'MOBILE_SERVICE_ITEMS': render_nav_items(nav['services'], service_key, True),
            'SECTOR_ITEMS': render_nav_items(nav['sectors'], sector_key),
            'MOBILE_SECTOR_ITEMS': render_nav_items(nav['sectors'], sector_key, True),
            'RESOURCE_ITEMS': render_nav_items(nav['resources'], resource_key),
            'MOBILE_RESOURCE_ITEMS': render_nav_items(nav['resources'], resource_key, True),
        })
        footer = replace_tokens(footer_tpl, {
            'BRAND_ICON': BRAND_ICON,
            'FOOTER_SERVICE_ITEMS': render_footer_items(nav['services']),
            'FOOTER_SECTOR_ITEMS': render_footer_items(nav['sectors']),
            'FOOTER_RESOURCE_ITEMS': render_footer_items(nav['resources']),
        })
        whats = replace_tokens(whatsapp_tpl, {'WHATSAPP_SVG': WHATSAPP_SVG})
        extra_styles = '\n'.join(f'  <link rel="stylesheet" href="/{s}" />' for s in meta.get('styles', []))
        extra_scripts = '\n'.join(f'  <script src="/{s}" defer></script>' for s in meta.get('scripts', []))
        content = read(SRC/'pages'/meta['source'])
        canonical = BASE_URL + meta['route']
        structured = meta.get('structured_data') or ''
        if structured:
            structured = '  <script type="application/ld+json">\n' + structured + '\n  </script>'
        output = replace_tokens(base, {
            'TITLE': html.escape(meta['title'], quote=False),
            'DESCRIPTION': html.escape(meta['description'], quote=True),
            'OG_TITLE': html.escape(meta['og_title'], quote=True),
            'OG_DESCRIPTION': html.escape(meta['og_description'], quote=True),
            'CANONICAL': canonical,
            'EXTRA_STYLES': extra_styles,
            'STRUCTURED_DATA': structured,
            'HEADER': header,
            'CONTENT': content,
            'FOOTER': footer,
            'WHATSAPP': whats,
            'EXTRA_SCRIPTS': extra_scripts,
        })
        target = DIST/output_rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(output, encoding='utf-8')
        built_routes.append(meta['route'])

    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{BASE_URL}{route}</loc></url>\n' for route in built_routes) + '</urlset>\n'
    (DIST/'sitemap.xml').write_text(sitemap, encoding='utf-8')
    (DIST/'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {BASE_URL}/sitemap.xml\n', encoding='utf-8')
    print(f'{len(built_routes)} pages générées dans {DIST}')

PROD_CALENDAR_URL = 'https://studio.synumanus.fr/discovery-call-calendar'

def apply_preprod(calendar_url: str) -> None:
    """Transforme dist/ en pré-production (B6 §4.1, condition C4).

    - robots.txt interdit tout et .htaccess ajoute X-Robots-Tag noindex : la
      pré-production n'est jamais indexée en doublon du site ;
    - config.js pointe vers le calendrier de TEST systeme.io : jamais le vrai.
    Fermeture sûre : toute anomalie arrête le build au lieu de publier un dist
    à moitié configuré.
    """
    url = calendar_url.strip()
    if url == 'aucun':
        # Calendrier désactivé en attendant la page de test publique : l'étape
        # « Choisir un créneau » reste vide, aucun rendez-vous possible.
        url = ''
    elif not re.fullmatch(r'https://[^\s\'"]+', url):
        raise SystemExit('Pré-production : --calendrier-test=https://… (ou =aucun) obligatoire.')
    if url and ('/dashboard/' in url or url.rstrip('/') == PROD_CALENDAR_URL):
        raise SystemExit('Pré-production : ni le vrai calendrier, ni une page d’administration systeme.io.')
    config_path = DIST/'config.js'
    config, count = re.subn(r"systemeIoCalendarUrl:\s*'[^']*'", f"systemeIoCalendarUrl: '{url}'", config_path.read_text(encoding='utf-8'))
    if count != 1:
        raise SystemExit('Pré-production : systemeIoCalendarUrl introuvable dans config.js.')
    config_path.write_text(config, encoding='utf-8')
    (DIST/'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
    htaccess = DIST/'.htaccess'
    htaccess.write_text(htaccess.read_text(encoding='utf-8').rstrip('\n') + '\n\n'
        '# Pré-production uniquement : ne jamais publier ce bloc en production.\n'
        '<IfModule mod_headers.c>\n  Header set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n', encoding='utf-8')
    print(f"Pré-production : calendrier de test {url or 'désactivé'}, robots.txt Disallow, X-Robots-Tag noindex.")

if __name__ == '__main__':
    import sys
    build()
    if '--preprod' in sys.argv:
        arg = next((a for a in sys.argv if a.startswith('--calendrier-test=')), '')
        apply_preprod(arg.split('=', 1)[1] if arg else '')
