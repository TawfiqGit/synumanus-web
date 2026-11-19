#!/usr/bin/env python3
"""Générateur statique Synumanus — architecture finale à URLs dossiers."""
from pathlib import Path
import json, shutil, html

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

def build() -> None:
    """Génère toutes les pages, le sitemap et robots.txt."""
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    copy_static()
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
            structured = meta.get('structured_data') or ''
            if structured:
                structured = '  <script type="application/ld+json">\n' + structured + '\n  </script>'
            output = replace_tokens(base_v2, {
                'TITLE': html.escape(meta['title'], quote=False),
                'DESCRIPTION': html.escape(meta['description'], quote=True),
                'OG_TITLE': html.escape(meta['og_title'], quote=True),
                'OG_DESCRIPTION': html.escape(meta['og_description'], quote=True),
                'CANONICAL': BASE_URL + meta['route'],
                'EXTRA_STYLES': '\n'.join(f'  <link rel="stylesheet" href="/{s}" />' for s in meta.get('styles', [])),
                'STRUCTURED_DATA': structured,
                'BODY_CLASS': meta.get('body_class', ''),
                'HEADER': header,
                'CONTENT': content,
                'FOOTER': footer,
                'WHATSAPP': whats,
                'EXTRA_SCRIPTS': '\n'.join(f'  <script src="/{s}" defer></script>' for s in meta.get('scripts', [])),
            })
            target = DIST/output_rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(output, encoding='utf-8')
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

if __name__ == '__main__':
    build()
