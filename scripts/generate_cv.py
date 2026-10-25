#!/usr/bin/env python3
"""Generate an academically formatted CV from the same Pages CMS JSON as the site.

Layout follows the user-supplied traditional CV: serif typography, centered name,
navy section headings, left-aligned dates, dense entries, page header/numbering.
The content is read at build time. Uploaded manual PDFs are never modified.
"""
from __future__ import annotations

import json
import re
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageTemplate, Paragraph,
    Spacer, Table, TableStyle, HRFlowable, Flowable,
)
from reportlab.pdfgen import canvas as pdfcanvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/documents/julide-kahkeci-cv.pdf'
NAVY = colors.HexColor('#0e2841')
BLACK = colors.HexColor('#131313')
GREY = colors.HexColor('#484848')
RULE = colors.HexColor('#1e5971')
PAGE_W, PAGE_H = letter
LM = 54
RM = 54
CONTENT_W = PAGE_W - LM - RM
DATE_W = 91
GAP = 7


def get(name, fallback=None):
    path = ROOT / 'content' / f'{name}.json'
    if not path.exists():
        return [] if fallback is None else fallback
    with path.open(encoding='utf-8') as f:
        return json.load(f)


def records(name):
    raw = get(name, [])
    if not isinstance(raw, list):
        return []
    selected = [i for i in raw if isinstance(i, dict) and i.get('visible', True) is not False]
    return [x for _, x in sorted(enumerate(selected), key=lambda o: (float(o[1].get('order', 999) or 0), o[0]))]


def clean(value):
    """Spell out ampersands in user-visible CV text only (never in URLs)."""
    val = str(value or '').strip()
    return re.sub(r'\s*&\s*', ' and ', val)


def safe(value):
    return escape(clean(value)).replace('\n', '<br/>')


def font_setup():
    for directory in ('/usr/share/fonts/truetype/liberation2', '/usr/share/fonts/truetype/liberation'):
        d = Path(directory)
        paths = [d / f'LiberationSerif-{x}.ttf' for x in ('Regular','Bold','Italic','BoldItalic')]
        if all(p.exists() for p in paths):
            for name, path in zip(('CVSerif','CVSerifBold','CVSerifItalic','CVSerifBoldItalic'), paths):
                pdfmetrics.registerFont(TTFont(name, str(path)))
            pdfmetrics.registerFontFamily('CVSerif', normal='CVSerif', bold='CVSerifBold',
                                           italic='CVSerifItalic', boldItalic='CVSerifBoldItalic')
            return 'CVSerif', 'CVSerifBold', 'CVSerifItalic'
    # All runners also install DejaVu; graceful deterministic fallback.
    d = Path('/usr/share/fonts/truetype/dejavu')
    for name, filename in (('CVSerif','DejaVuSerif.ttf'),('CVSerifBold','DejaVuSerif-Bold.ttf'),
                           ('CVSerifItalic','DejaVuSerif-Italic.ttf'),('CVSerifBoldItalic','DejaVuSerif-BoldItalic.ttf')):
        pdfmetrics.registerFont(TTFont(name, str(d/filename)))
    pdfmetrics.registerFontFamily('CVSerif', normal='CVSerif', bold='CVSerifBold',
                                   italic='CVSerifItalic', boldItalic='CVSerifBoldItalic')
    return 'CVSerif', 'CVSerifBold', 'CVSerifItalic'


class NumberedCanvas(pdfcanvas.Canvas):
    """Add the traditional 'Page X of Y' line with correct total page count."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._page_states = []

    def showPage(self):
        self._page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._page_states)
        for state in self._page_states:
            self.__dict__.update(state)
            self._page_header(total)
            super().showPage()
        super().save()

    def _page_header(self, total):
        name = clean(get('site', {}).get('name', 'Jülide Kahkeci'))
        self.setFont('CVSerifBold', 9.4)
        self.setFillColor(BLACK)
        self.drawString(LM, PAGE_H - 45, f'{name} | Curriculum Vitae')
        self.setFont('CVSerif', 9.4)
        self.drawRightString(PAGE_W - RM, PAGE_H - 45, f'Page {self._pageNumber} of {total}')


class AcademicCV(BaseDocTemplate):
    pass


def make_styles():
    def sty(name, font='CVSerif', size=9.05, leading=10.85, **kwargs):
        kwargs.setdefault('textColor', BLACK)
        return ParagraphStyle(name, fontName=font, fontSize=size, leading=leading,
                              allowWidows=0, allowOrphans=0, **kwargs)
    return {
        'name': sty('Name', font='CVSerifBold', size=16.6, leading=19.6,
                    alignment=TA_CENTER, spaceAfter=0),
        'contact': sty('Contact', size=8.65, leading=11, alignment=TA_CENTER),
        'section': sty('Section', font='CVSerifBold', size=10.8, leading=13.6,
                       textColor=NAVY, spaceBefore=8, spaceAfter=1.5, keepWithNext=True),
        'subhead': sty('Subheading', font='CVSerifBold', size=9.6, leading=12,
                       spaceBefore=4, spaceAfter=3, keepWithNext=True),
        'date': sty('Date', size=8.9, leading=11.1),
        'entry': sty('Entry', font='CVSerifBold', size=9.25, leading=10.85),
        'institution': sty('Institution', font='CVSerifItalic', size=9.0, leading=10.8),
        'body': sty('Body', size=8.95, leading=10.85),
        'bodyindent': sty('BodyIndented', size=8.95, leading=10.85, leftIndent=7, firstLineIndent=-7),
        'award': sty('Award', size=8.95, leading=10.85),
        'pub': sty('Publication', size=9.0, leading=11.0, leftIndent=13, firstLineIndent=-13,
                   spaceAfter=4),
    }


def build():
    font_setup()
    st = make_styles()
    site = get('site', {})
    contact = get('contact', {})
    flags = get('sections', {})
    if not isinstance(flags, dict): flags = {}
    show = lambda key: flags.get('show_cv_'+key, True) is not False

    story = []
    def para(value, kind): return Paragraph(safe(value), st[kind])
    def section(title):
        story.append(Paragraph(safe(title.upper()), st['section']))
    def sub(title): story.append(Paragraph(safe(title), st['subhead']))

    def dated(item, notes=True, body_as_bullet=False):
        left = []
        date = item.get('date_label') or item.get('year') or ''
        if date: left.append(para(date, 'date'))
        right = []
        if item.get('title'): right.append(para(item['title'], 'entry'))
        if item.get('organization'): right.append(para(item['organization'], 'institution'))
        if notes:
            bits = [item.get(k) for k in ('amount','description') if item.get(k)]
            for description in bits:
                contents = safe(description)
                if body_as_bullet: contents = '• ' + contents
                right.append(Paragraph(contents, st['body']))
        if not left and not right: return
        # Date left, content right as in the user's original academic CV.
        t = Table([[left or '', right]], colWidths=[DATE_W, CONTENT_W-DATE_W],
                  hAlign='LEFT', style=TableStyle([
                      ('VALIGN',(0,0),(-1,-1),'TOP'),
                      ('LEFTPADDING',(0,0),(0,0),0),('RIGHTPADDING',(0,0),(0,0),GAP),
                      ('LEFTPADDING',(1,0),(1,0),0),('RIGHTPADDING',(1,0),(1,0),0),
                      ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),
                  ]))
        story.append(KeepTogether([t,Spacer(1,2.5)]))

    def insert_records(section_name, dataset, body_as_bullet=False):
        entries = records(dataset)
        if entries:
            section(section_name)
            for item in entries: dated(item, body_as_bullet=body_as_bullet)

    # Header mirrors the original: centered name, a single compact contact line, blue rule.
    story.append(Paragraph(safe(site.get('name') or 'Jülide Kahkeci'), st['name']))
    loc = contact.get('address_text') or site.get('location') or ''
    city = re.sub(r'\s*,?\s*Canada\s*$', '', str(loc).replace('\n', ', '), flags=re.I)
    mail = contact.get('email_address') or site.get('email') or ''
    contact_bits = []
    if mail:
        contact_bits.append(f'<link href="mailto:{escape(str(mail),quote=True)}" color="#484848">{safe(mail)}</link>')
    if city: contact_bits.append(safe(city))
    for field, label in [('orcid_url','ORCID'),('scholar_url','Scholar'),('scopus_url','Scopus'),
                          ('wos_url','Web of Science'),('linkedin_url','LinkedIn')]:
        url = site.get(field)
        if url:
            contact_bits.append(f'<link href="{escape(str(url),quote=True)}" color="#484848"><u>{safe(label)}</u></link>')
    story.append(Paragraph(' | '.join(contact_bits), st['contact']))
    story.append(HRFlowable(CONTENT_W, thickness=1.0, color=RULE, spaceBefore=3, spaceAfter=3))

    # Intentionally omit the former online-CV introductory sentence.
    if show('education'): insert_records('Education', 'education')
    if show('appointments'): insert_records('Research experience', 'experience', body_as_bullet=True)

    if show('teaching'):
        teach = records('teaching')
        courses = [x for x in teach if x.get('category') not in ('Teaching Development','Mentorship')]
        development = [x for x in teach if x.get('category') == 'Teaching Development']
        mentorship = [x for x in teach if x.get('category') == 'Mentorship']
        if courses:
            section('Teaching experience')
            for x in courses: dated(x)
        if development:
            section('Teaching development')
            for x in development: dated(x)
        if mentorship:
            section('Mentorship')
            for x in mentorship: dated(x)

    if show('service'): insert_records('Service', 'service')
    if show('funding'): insert_records('Research funding', 'funding')

    if show('skills'):
        ss = records('skills')
        if ss:
            section('Technical skills')
            for entry in ss:
                value = entry.get('text','')
                if not value: continue
                # Preserve category: description on one compact line.
                if ':' in value:
                    group, detail = value.split(':',1)
                    story.append(Paragraph(f'<b>{safe(group)}:</b> {safe(detail)}', st['body']))
                else: story.append(para(value,'body'))

    if show('awards'): insert_records('Awards and recognition', 'awards')
    if show('affiliations'): insert_records('Professional affiliations','affiliations')

    if show('scholarly'):
        pub = records('publications')
        talks = records('presentations')
        if pub or talks:
            section('Publications and scholarly work')
            pub_types = [
                ('Peer-Reviewed Journal Articles', ('article','review')),
                ('Manuscripts Submitted', ('submitted',)),
                *([('Manuscripts in Preparation', ('in_preparation',))] if flags.get('show_publications_in_progress', True) is not False else []),
            ]
            for label, keys in pub_types:
                items = [p for p in pub if p.get('category') in keys]
                if not items: continue
                sub(label)
                for no, p in enumerate(items, 1):
                    pieces = []
                    authors = safe(p.get('authors'))
                    if authors: pieces.append(authors.rstrip('.'))
                    year = safe(p.get('year'))
                    if year: pieces.append(f'({year})')
                    title = safe(p.get('title'))
                    citation = '. '.join(x for x in pieces if x) + '. ' if pieces else ''
                    citation += title.rstrip('.') + '.' if title else ''
                    venue = safe(p.get('venue'))
                    details = safe(p.get('details'))
                    if venue or details:
                        citation += ' ' + ', '.join(s for s in (f'<i>{venue}</i>' if venue else '', details) if s).rstrip('.')+'.'
                    doi = str(p.get('doi') or '').strip()
                    if doi:
                        doi = re.sub(r'^https?://(?:dx\.)?doi\.org/', '', doi)
                        citation += ' DOI: ' + safe(doi)
                    story.append(Paragraph(f'{no}. {citation}', st['pub']))
            if talks:
                sub('Conference Presentations')
                for no, p in enumerate(talks,1):
                    authors = safe(p.get('authors'))
                    date = safe(p.get('date_label'))
                    title = safe(p.get('title'))
                    venue = safe(p.get('venue'))
                    entry = f'{no}. {authors}'
                    if date: entry += f' ({date})'
                    entry += f'. {title.rstrip(".")}.' if title else ''
                    if venue: entry += ' ' + venue.rstrip('.') + '.'
                    story.append(Paragraph(entry, st['pub']))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = AcademicCV(str(OUT), pagesize=letter, leftMargin=LM, rightMargin=RM,
                     topMargin=70, bottomMargin=40,
                     title=f'Curriculum Vitae - {clean(site.get("name", ""))}',
                     author=clean(site.get('name', '')))
    frame = Frame(LM, 40, CONTENT_W, PAGE_H-110, leftPadding=0,
                  rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(PageTemplate(id='Traditional CV', frames=[frame]))
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f'Generated traditional-format CV: {OUT} ({OUT.stat().st_size:,} bytes)')


if __name__ == '__main__':
    build()
