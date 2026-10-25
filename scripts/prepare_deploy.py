#!/usr/bin/env python3
"""Stage GitHub Pages. Honors the Pages CMS entire-CV visibility switch.
Run from any working directory; affects only the local _site build copy.
"""
from __future__ import annotations
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / '_site'

def copied_ignore(folder, names):
    blocked = {'.git', '.github', '_site', '__pycache__', '.pytest_cache',
               'node_modules', '.DS_Store'}
    return [name for name in names if name in blocked or name.endswith('.pyc')]

def remove_if_exists(path):
    if path.is_file():
        path.unlink()

def build():
    if DEST.exists():
        shutil.rmtree(DEST)
    shutil.copytree(ROOT, DEST, ignore=copied_ignore)
    flags_file = ROOT / 'content' / 'sections.json'
    flags = json.loads(flags_file.read_text(encoding='utf-8')) if flags_file.exists() else {}
    if flags.get('show_cv_page', True) is False:
        # /cv/ returns 404, while records are retained in GitHub for later restoration.
        remove_if_exists(DEST/'cv'/'index.html')
        remove_if_exists(DEST/'assets'/'documents'/'julide-kahkeci-cv.pdf')
        # Do not deploy the currently selected manual CV PDF either.
        cv_file = ROOT/'content'/'cv.json'
        cv = json.loads(cv_file.read_text(encoding='utf-8')) if cv_file.exists() else {}
        value = cv.get('uploaded_pdf')
        if isinstance(value, str):
            name = value.strip().replace('\\', '/').rsplit('/', 1)[-1]
            if (name and '..' not in name and name.lower().endswith('.pdf') and
                    value.strip().replace('\\','/').startswith(('/assets/documents/', 'assets/documents/',
                                                                   './assets/documents/', '../assets/documents/'))):
                remove_if_exists(DEST/'assets'/'documents'/name)
        print('CV page and selected PDF excluded from deployed site (CMS records preserved).')
    else:
        print('CV page published: manual PDF, if uploaded, takes priority in the download button.')
    print('Staged website at', DEST)

if __name__ == '__main__':
    build()
