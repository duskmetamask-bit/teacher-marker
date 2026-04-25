#!/usr/bin/env python3
"""Convert PickleNickAI markdown unit plans to HTML."""

import re
import os

BASE_TEMPLATE_PATH = "/home/dusk/.openclaw/vault/dawn-vault/shared/PROJECTS/pickle-nick-ai/design-system/base-template.html"
STYLES_CSS_PATH = "/home/dusk/.openclaw/vault/dawn-vault/shared/PROJECTS/pickle-nick-ai/design-system/styles.css"
UNITS_DIR = "/home/dusk/pickle-nick-ai/data/units"
OUTPUT_DIR = "/home/dusk/pickle-nick-ai/public/units"
REPO_DIR = "/home/dusk/pickle-nick-ai"

# Read base template
with open(BASE_TEMPLATE_PATH) as f:
    base_template = f.read()

files = [
    ("reading-comprehension-F.md", "reading-comprehension-F.html", "Reading Comprehension", "English", "Foundation", 8, 24),
    ("reading-comprehension-Y1.md", "reading-comprehension-Y1.html", "Reading Comprehension", "English", "Year 1", 8, 24),
    ("reading-comprehension-Y2.md", "reading-comprehension-Y2.html", "Reading Comprehension", "English", "Year 2", 8, 24),
    ("reading-comprehension-Y3.md", "reading-comprehension-Y3.html", "Reading Comprehension", "English", "Year 3", 8, 24),
    ("reading-comprehension-Y4.md", "reading-comprehension-Y4.html", "Reading Comprehension", "English", "Year 4", 8, 24),
    ("hass-geography-F.md", "hass-geography-F.html", "Features of Places", "HASS/Geography", "Foundation", 7, 21),
    ("hass-geography-Y1.md", "hass-geography-Y1.html", "Features of Places", "HASS/Geography", "Year 1", 7, 21),
    ("hass-geography-Y2.md", "hass-geography-Y2.html", "Features of Places", "HASS/Geography", "Year 2", 7, 21),
    ("hass-geography-Y3.md", "hass-geography-Y3.html", "Features of Places", "HASS/Geography", "Year 3", 7, 21),
    ("hass-geography-Y4.md", "hass-geography-Y4.html", "Features of Places", "HASS/Geography", "Year 4", 7, 21),
    ("hass-geography-Y5.md", "hass-geography-Y5.html", "Features of Places", "HASS/Geography", "Year 5", 7, 21),
    ("science-physical-F.md", "science-physical-F.html", "Properties and Changes", "Science", "Foundation", 6, 18),
    ("science-physical-Y1.md", "science-physical-Y1.html", "Properties and Changes", "Science", "Year 1", 6, 18),
    ("science-physical-Y2.md", "science-physical-Y2.html", "Properties and Changes", "Science", "Year 2", 6, 18),
]

def md_to_html(text):
    """Convert markdown-like text to HTML."""
    lines = text.split('\n')
    result = []
    in_table = False
    table_rows = []

    for line in lines:
        # Skip markdown headers (we'll handle sections differently)
        if re.match(r'^#{1,6}\s', line):
            continue
        # Skip markdown bold/italic lines that are metadata
        if re.match(r'\*\*Unit Duration|\*\*Year Level|\*\*Curriculum|\*\*Cold Task|\*\*Hot Task|\*\*Mentor Text', line):
            continue
        # Skip HR
        if re.match(r'^---$', line):
            continue
        # Handle table
        if '|' in line and re.match(r'^\|', line):
            if not in_table:
                in_table = True
                table_rows = []
            cols = [c.strip() for c in line.split('|')[1:-1]]
            table_rows.append(cols)
            continue
        else:
            if in_table:
                # Emit table
                if len(table_rows) >= 2:
                    headers = table_rows[0]
                    result.append('<div class="table-wrapper"><table><thead><tr>')
                    for h in headers:
                        result.append(f'<th>{h}</th>')
                    result.append('</tr></thead><tbody>')
                    for row in table_rows[1:]:
                        result.append('<tr>')
                        for cell in row:
                            result.append(f'<td>{cell}</td>')
                        result.append('</tr>')
                    result.append('</tbody></table></div>')
                in_table = False
                table_rows = []

        # Skip empty lines that are just separators
        if line.strip() == '':
            continue

        # Convert bold
        line = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', line)
        # Convert italic
        line = re.sub(r'\*(.+?)\*', r'<em>\1</em>', line)

        # Escape HTML
        line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

        result.append(line)

    return '\n'.join(result)


def parse_markdown_file(filepath):
    """Parse a markdown file and extract all content."""
    with open(filepath) as f:
        content = f.read()

    data = {
        'title': '',
        'subject': '',
        'year_level': '',
        'weeks': 8,
        'lessons': 24,
        'subtitle': '',
        'mentor_text': '',
        'curriculum_code': '',
        'focus_area': '',
        'teaching_model': '',
        'cold_task_week': 'Week 1',
        'cold_task_lesson': 'Lesson 1',
        'cold_task_desc': '',
        'cold_task_time': '',
        'hot_task_week': 'Week 8',
        'hot_task_lesson': 'Lesson 1',
        'hot_task_desc': '',
        'hot_task_time': '',
        'learning_intention': '',
        'success_criteria': [],
        'weekly_summary': [],  # list of (week, focus, lessons, highlights)
        'weeks_content': [],  # list of week sections
        'rubric_rows': [],
        'eal_strategies': [],
        'gifted_strategies': [],
        'nep_strategies': [],
    }

    lines = content.split('\n')

    # Parse metadata from top of file
    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Unit title
        m = re.match(r'^#\s+(.+)\s+\[–\s+\w+\]$', line)
        if m:
            data['title'] = m.group(1)

        if '**Unit Duration:**' in line:
            m = re.search(r'(\d+)\s*weeks', line)
            if m:
                data['weeks'] = int(m.group(1))
            m = re.search(r'(\d+)\s*lessons', line)
            if m:
                data['lessons'] = int(m.group(1))

        if '**Year Level:**' in line:
            m = re.search(r'\*\*Year Level:\*\*\s*(.+)', line)
            if m:
                data['year_level'] = m.group(1).strip()

        if '**Curriculum Link:**' in line:
            m = re.search(r'\*\*Curriculum Link:\*\*\s*(.+)', line)
            if m:
                data['curriculum_code'] = m.group(1).strip()

        if '**Focus:**' in line:
            m = re.search(r'\*\*Focus:\*\*\s*(.+)', line)
            if m:
                data['focus_area'] = m.group(1).strip()

        if '**Mentor Text:**' in line:
            m = re.search(r'\*\*Mentor Text:\*\*\s*(.+)', line)
            if m:
                data['mentor_text'] = m.group(1).strip()

        if '**Cold Task:**' in line:
            m = re.search(r'Week\s+(\d+),\s+Lesson\s+(\d+)', line)
            if m:
                data['cold_task_week'] = f"Week {m.group(1)}"
                data['cold_task_lesson'] = f"Lesson {m.group(2)}"
            m2 = re.search(r'—\s*(.+)', line)
            if m2:
                data['cold_task_desc'] = m2.group(1).strip()

        if '**Hot Task:**' in line:
            m = re.search(r'Week\s+(\d+),\s+Lesson\s+(\d+)', line)
            if m:
                data['hot_task_week'] = f"Week {m.group(1)}"
                data['hot_task_lesson'] = f"Lesson {m.group(2)}"
            m2 = re.search(r'—\s*(.+)', line)
            if m2:
                data['hot_task_desc'] = m2.group(1).strip()

        i += 1

    # Find unit big idea (for subtitle)
    m = re.search(r'\*\*Unit Big Idea:\*\*\s*(.+)', content)
    if m:
        data['subtitle'] = m.group(1).strip()

    # Parse Unit Overview
    m = re.search(r'\*\*Learning Intention:\*\*\s*(?:We are learning to\s*)?(.+)', content)
    if m:
        data['learning_intention'] = m.group(1).strip()

    # Success criteria
    sc_match = re.search(r'\*\*Success Criteria:\*\*\n((?:\s*-\s*.+\n)+)', content)
    if sc_match:
        criteria_text = sc_match.group(1)
        data['success_criteria'] = re.findall(r'-\s*(.+)', criteria_text)

    # Determine teaching model
    if 'Gradual Release' in content:
        data['teaching_model'] = 'Gradual Release Model'
    elif '5E' in content or '5E Model' in content:
        data['teaching_model'] = '5E Model'
    else:
        data['teaching_model'] = '5E Model'

    # Parse Weekly Summary table
    table_match = re.search(r'\*\*Weekly Summary\*\*\s*\n((?:\|.+\|\n)+)', content)
    if table_match:
        table_text = table_match.group(1)
        for row in table_text.strip().split('\n'):
            if re.match(r'\|[-:\s]+\|', row):
                continue
            cols = [c.strip() for c in row.split('|')[1:-1]]
            if len(cols) >= 4:
                week_num = re.search(r'\d+', cols[0])
                data['weekly_summary'].append({
                    'week': cols[0],
                    'focus': cols[1],
                    'lessons': cols[2],
                    'highlights': cols[3],
                })

    # Parse weekly content sections
    week_pattern = re.compile(r'^##\s+WEEK\s+(\d+)\s+[—\-]\s+(.+)$', re.IGNORECASE)
    lesson_pattern = re.compile(r'^###\s+Lesson\s+(\d+):\s+(.+)$', re.IGNORECASE)
    time_type_pattern = re.compile(r'\*\*Time:\*\*\s*(\d+)\s*minutes?\s*\|\s*\*\*Type:\*\*\s*(.+)', re.IGNORECASE)

    current_week = None
    current_week_focus = ''
    current_week_theme = ''
    current_lesson = None

    week_content = {}  # week_num -> content

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        m = week_pattern.match(line)
        if m:
            wk = m.group(1)
            focus = m.group(2).strip()
            current_week = wk
            current_week_focus = focus
            if wk not in week_content:
                week_content[wk] = {'focus': focus, 'theme': '', 'lessons': []}
            i += 1
            continue

        # Week theme line
        if current_week and re.match(r'^\*\*Theme:\*\*\s*(.+)', line):
            theme_match = re.search(r'\*\*Theme:\*\*\s*(.+)', line)
            if theme_match:
                week_content[current_week]['theme'] = theme_match.group(1).strip()

        # Lesson header
        m = lesson_pattern.match(line)
        if m:
            lesson_num = m.group(1)
            lesson_title = m.group(2).strip()
            current_lesson = {
                'number': lesson_num,
                'title': lesson_title,
                'time': '',
                'type': '',
                'phases': [],
            }
            # Find time/type on same or next line
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                tm = time_type_pattern.search(next_line)
                if tm:
                    current_lesson['time'] = tm.group(1) + ' min'
                    current_lesson['type'] = tm.group(2).strip()
                    i += 1

            # Read phase table (next few lines)
            j = i + 1
            phase_rows = []
            while j < len(lines) and j < i + 20:
                l = lines[j].strip()
                if '|' in l and re.match(r'^\|', l):
                    cols = [c.strip() for c in l.split('|')[1:-1]]
                    phase_rows.append(cols)
                elif re.match(r'^\*\*Differentiation', l) or re.match(r'^---$', l) or re.match(r'^##\s', l) or re.match(r'^#\s', l):
                    break
                j += 1

            # Parse phase rows (skip header)
            if len(phase_rows) >= 2:
                for row in phase_rows[1:]:
                    if len(row) >= 3:
                        phase_name = row[0]
                        # Extract time from phase name
                        time_m = re.search(r'\((\d+)\s*min\)', phase_name)
                        time_str = time_m.group(1) + ' min' if time_m else ''
                        phase_clean = re.sub(r'\s*\(\d+\s*min\)\s*', '', phase_name).strip()
                        current_lesson['phases'].append({
                            'name': phase_clean,
                            'teacher': row[1] if len(row) > 1 else '',
                            'students': row[2] if len(row) > 2 else '',
                            'time': time_str,
                        })

            if current_week:
                week_content[current_week]['lessons'].append(current_lesson)
            i += 1
            continue

        # Check for differentiation note within lesson
        if current_lesson and re.match(r'^\*\*Differentiation', line):
            diff_match = re.search(r'\*\*Differentiation:\*\*\s*(.+)', line)
            if diff_match and current_lesson.get('diff'):
                current_lesson['diff'] += ' ' + diff_match.group(1).strip()
            elif diff_match:
                current_lesson['diff'] = diff_match.group(1).strip()

        i += 1

    # Build weeks content list
    for wk_num in sorted(week_content.keys(), key=lambda x: int(x)):
        data['weeks_content'].append(week_content[wk_num])

    # Parse Rubric section
    rubric_match = re.search(r'\*\*Rubric Criteria \((.+?)\):\*\*(?:\s*\n)((?:\|.+\|\n)+)', content)
    if rubric_match:
        rubric_text = rubric_match.group(2)
        for row in rubric_text.strip().split('\n'):
            if re.match(r'\|[-:\s]+\|', row):
                continue
            cols = [c.strip() for c in row.split('|')[1:-1]]
            if len(cols) >= 5:
                data['rubric_rows'].append(cols)

    # Parse rubric from end of file
    rubric_section = re.search(r'## Rubric.*?\n((?:\|.+\|\n)+)', content, re.DOTALL)
    if rubric_section:
        for row in rubric_section.group(1).strip().split('\n'):
            if re.match(r'\|[-:\s]+\|', row):
                continue
            cols = [c.strip() for c in row.split('|')[1:-1]]
            if len(cols) >= 5:
                data['rubric_rows'].append(cols)

    # Parse Differentiation section
    diff_section = re.search(r'## Differentiation.*?\n(.*)', content, re.DOTALL)
    if diff_section:
        diff_text = diff_section.group(1)
        # EAL
        eal_match = re.search(r'\*\*EAL Learners:\*\*\s*\n((?:\s*-\s*.+\n)+)', diff_text)
        if eal_match:
            data['eal_strategies'] = re.findall(r'-\s*(.+)', eal_match.group(1))
        gifted_match = re.search(r'\*\*Gifted &amp; Talented:\*\*\s*\n((?:\s*-\s*.+\n)+)', diff_text)
        if gifted_match:
            data['gifted_strategies'] = re.findall(r'-\s*(.+)', gifted_match.group(1))
        nep_match = re.search(r'\*\*Students with NEPs:\*\*\s*\n((?:\s*-\s*.+\n)+)', diff_text)
        if nep_match:
            data['nep_strategies'] = re.findall(r'-\s*(.+)', nep_match.group(1))

    return data


def build_week_summary_table(weekly_summary):
    """Build HTML for weekly summary table."""
    html = '<div class="week-summary">\n'
    num_weeks = len(weekly_summary)
    html += f'<h2>{num_weeks}-Week Overview</h2>\n'
    html += '<div class="table-wrapper"><table>\n'
    html += '<thead><tr><th>Week</th><th>Focus</th><th>Lessons</th><th>Highlights</th></tr></thead>\n'
    html += '<tbody>\n'
    for row in weekly_summary:
        week_num = re.search(r'\d+', row['week'])
        html += f'<tr>\n'
        html += f'<td class="week-num">{row["week"]}</td>\n'
        html += f'<td class="week-focus">{row["focus"]}</td>\n'
        # Parse lessons
        lesson_tags = ''
        for part in row['lessons'].split('/'):
            part = part.strip()
            lesson_tags += f'<span class="lesson-tag">Lesson {part.split(":")[0].strip()}</span>\n'
        html += f'<td><div class="lesson-tags">{lesson_tags}</div></td>\n'
        html += f'<td>{row["highlights"]}</td>\n'
        html += '</tr>\n'
    html += '</tbody></table></div></div>\n'
    return html


def build_criteria_block(learning_intention, success_criteria):
    """Build HTML for success criteria block."""
    html = '<div class="criteria-block">\n'
    html += '<div class="criteria-block__header">\n'
    html += '<span class="criteria-block__label">Learning Intention</span>\n'
    html += '</div>\n'
    html += f'<h2 class="criteria-block__title">We are learning to {learning_intention}.</h2>\n'
    html += '<ul class="criteria-list">\n'
    for sc in success_criteria:
        html += f'<li class="criteria-list__item">{sc}</li>\n'
    html += '</ul>\n</div>\n'
    return html


def build_task_card(task_type, week, lesson, desc, time):
    """Build HTML for cold/hot task card."""
    label = 'Pre-Assessment — Cold Task' if task_type == 'cold' else 'Post-Assessment — Hot Task'
    label_class = 'cold' if task_type == 'cold' else 'hot'
    html = f'<div class="task-card task-card--{label_class}">\n'
    html += f'<div class="task-card__label">{label}</div>\n'
    html += f'<div class="task-card__title">{week}, {lesson}</div>\n'
    html += f'<p class="task-card__desc">{desc}</p>\n'
    html += f'<div class="task-card__meta">\n'
    if time:
        html += f'<span class="task-card__tag task-card__tag--time">{time}</span>\n'
    if task_type == 'cold':
        html += f'<span class="task-card__tag">Same task as Hot Task ({week.replace("Week", "Week ")})</span>\n'
    else:
        html += f'<span class="task-card__tag">Same task as Cold Task ({week.replace("Week", "Week ")}) — measure growth</span>\n'
    html += '</div>\n</div>\n'
    return html


def build_week_section(week_data, week_num):
    """Build HTML for a week section."""
    html = f'<section class="week-section">\n'
    html += f'<div class="week-header">\n'
    html += f'<h3 class="week-header__title">Week {week_num} — {week_data["focus"]}</h3>\n'
    if week_data.get('theme'):
        html += f'<span class="week-header__badge">{week_data["theme"]}</span>\n'
    html += '</div>\n'
    html += '<div class="week-body">\n'

    for lesson in week_data.get('lessons', []):
        # Determine lesson type class
        lesson_type_lower = lesson.get('type', '').lower()
        if 'explicit' in lesson_type_lower:
            type_class = 'explicit'
        elif 'guided' in lesson_type_lower or 'we do' in lesson_type_lower:
            type_class = 'guided'
        elif 'independent' in lesson_type_lower or 'you do' in lesson_type_lower:
            type_class = 'independent'
        elif 'assessment' in lesson_type_lower:
            type_class = 'assessment'
        else:
            type_class = 'explicit'

        type_display = lesson.get('type', 'Explicit Teaching')

        html += f'<div class="lesson-card">\n'
        html += f'<div class="lesson-card__header">\n'
        html += f'<h4 class="lesson-card__title">Lesson {lesson["number"]}: {lesson["title"]}</h4>\n'
        html += '<div class="lesson-card__meta">\n'
        if lesson.get('time'):
            html += f'<span class="lesson-card__time">{lesson["time"]}</span>\n'
        html += f'<span class="lesson-card__type lesson-card__type--{type_class}">{type_display}</span>\n'
        html += '</div>\n'
        html += '</div>\n'

        # Build lesson table
        if lesson.get('phases'):
            html += '<table class="lesson-table">\n'
            html += '<thead><tr><th>Phase</th><th>Teacher (I Do)</th><th>Students</th></tr></thead>\n'
            html += '<tbody>\n'
            for phase in lesson['phases']:
                html += f'<tr>\n'
                time_str = f'({phase["time"]})' if phase['time'] else ''
                html += f'<td>{phase["name"]} {time_str}</td>\n'
                html += f'<td>{phase["teacher"]}</td>\n'
                html += f'<td>{phase["students"]}</td>\n'
                html += '</tr>\n'
            html += '</tbody></table>\n'

        # Differentiation
        if lesson.get('diff'):
            html += f'<div class="lesson-card__diff"><strong>Differentiation</strong>{lesson["diff"]}</div>\n'

        html += '</div>\n'

    html += '</div>\n'
    html += '</section>\n'
    return html


def build_rubric_block(rubric_rows, unit_name, year_levels, curriculum):
    """Build HTML for rubric block."""
    if not rubric_rows:
        return ''
    html = '<div class="rubric-block">\n'
    html += f'<h3 class="rubric-block__title">Rubric — {unit_name} ({year_levels})</h3>\n'
    html += f'<p class="rubric-block__sub">{curriculum}</p>\n'
    html += '<div class="table-wrapper">\n'
    html += '<table class="rubric-table">\n'
    html += '<thead><tr><th>Criterion</th><th class="grade-a">A</th><th class="grade-b">B</th><th class="grade-c">C</th><th class="grade-d">D</th><th class="grade-e">E</th></tr></thead>\n'
    html += '<tbody>\n'
    for row in rubric_rows:
        html += '<tr>\n'
        html += f'<td>{row[0]}</td>\n'
        for i in range(1, 5):
            html += f'<td class="grade-{chr(97+i)}">{row[i] if i < len(row) else ""}</td>\n'
        html += '</tr>\n'
    html += '</tbody>\n'
    html += '</table>\n'
    html += '</div>\n'
    html += '</div>\n'
    return html


def build_diff_grid(eal, gifted, nep):
    """Build HTML for differentiation grid."""
    html = '<div class="diff-grid">\n'

    if eal:
        html += '<div class="diff-card diff-card--eal"><h4>EAL Learners</h4><ul>\n'
        for s in eal:
            html += f'<li>{s}</li>\n'
        html += '</ul></div>\n'

    if gifted:
        html += '<div class="diff-card diff-card--gifted"><h4>Gifted &amp; Talented</h4><ul>\n'
        for s in gifted:
            html += f'<li>{s}</li>\n'
        html += '</ul></div>\n'

    if nep:
        html += '<div class="diff-card diff-card--nep"><h4>Students with NEPs</h4><ul>\n'
        for s in nep:
            html += f'<li>{s}</li>\n'
        html += '</ul></div>\n'

    html += '</div>\n'
    return html


def convert_file(md_filename, html_filename, subject, year_level, weeks, lessons):
    """Convert a single markdown file to HTML."""
    md_path = os.path.join(UNITS_DIR, md_filename)
    html_path = os.path.join(OUTPUT_DIR, html_filename)

    data = parse_markdown_file(md_path)

    # Override with provided values
    if subject:
        data['subject'] = subject
    if year_level:
        data['year_level'] = year_level
    if weeks:
        data['weeks'] = weeks
    if lessons:
        data['lessons'] = lessons

    # Build HTML
    html = base_template

    # Replace placeholders
    html = html.replace('<!-- UNIT TITLE -->', data.get('title', ''))
    html = html.replace('<!-- SUBJECT -->', data.get('subject', ''))
    html = html.replace('<!-- YEAR LEVEL -->', data.get('year_level', ''))
    html = html.replace('<!-- X -->', str(data.get('weeks', '')))
    html = html.replace('<!-- XX -->', str(data.get('lessons', '')))
    html = html.replace('<!-- SUBTITLE / FOCUS AREA -->', data.get('subtitle', '') or data.get('focus_area', ''))
    html = html.replace('<!-- BOOK TITLE -->', extract_book_title(data.get('mentor_text', '')))
    html = html.replace('<!-- BOOK DESCRIPTION -->', extract_book_desc(data.get('mentor_text', '')))
    html = html.replace('<!-- CURRICULUM CODE -->', data.get('curriculum_code', ''))
    html = html.replace('<!-- FOCUS AREA -->', data.get('focus_area', ''))
    html = html.replace('<!-- GRADUAL RELEASE / 5E -->', data.get('teaching_model', ''))
    html = html.replace('<!-- CURRICULUM -->', data.get('curriculum_code', ''))
    html = html.replace('<!-- YEARS -->', data.get('year_level', ''))

    # Cold task
    html = html.replace('<!-- WEEK -->', data.get('cold_task_week', 'Week 1').replace('Week ', ''))
    html = html.replace('<!-- WEEK', data.get('cold_task_week', 'Week 1'))
    html = html.replace('<!-- X -->', data.get('cold_task_week', 'Week 1'))
    html = html.replace('<!-- TASK DESCRIPTION -->', data.get('cold_task_desc', ''))
    html = html.replace('<!-- XX -->', data.get('cold_task_time', '30'))

    # Build container content
    container_content = ''

    # Meta grid (using template placeholders, fill in manually)
    # We'll build it from scratch
    meta_grid = f'''  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-item__label">Curriculum</div>
      <div class="meta-item__value">{data.get('curriculum_code', '')}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Focus</div>
      <div class="meta-item__value">{data.get('focus_area', '')}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Teaching Model</div>
      <div class="meta-item__value">{data.get('teaching_model', '')}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Cold Task</div>
      <div class="meta-item__value">{data.get('cold_task_week', '')}, {data.get('cold_task_lesson', '')}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Hot Task</div>
      <div class="meta-item__value">{data.get('hot_task_week', '')}, {data.get('hot_task_lesson', '')}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Year Level</div>
      <div class="meta-item__value">{data.get('year_level', '')}</div>
    </div>
  </div>'''

    # Success criteria
    criteria_html = build_criteria_block(data.get('learning_intention', ''), data.get('success_criteria', []))

    # Cold task card
    cold_task_html = build_task_card('cold', data.get('cold_task_week', 'Week 1'),
                                      data.get('cold_task_lesson', 'Lesson 1'),
                                      data.get('cold_task_desc', ''),
                                      data.get('cold_task_time', ''))

    # Week summary
    weekly_summary_html = build_week_summary_table(data.get('weekly_summary', []))

    # Hot task card
    hot_task_html = build_task_card('hot', data.get('hot_task_week', f"Week {data.get('weeks', 8)}"),
                                     data.get('hot_task_lesson', 'Lesson 1'),
                                     data.get('hot_task_desc', ''),
                                     data.get('hot_task_time', ''))

    # Weeks content
    weeks_content_html = ''
    for i, week_data in enumerate(data.get('weeks_content', [])):
        week_num = i + 1
        weeks_content_html += build_week_section(week_data, week_num)

    # Rubric
    rubric_html = build_rubric_block(data.get('rubric_rows', []),
                                      data.get('title', ''),
                                      data.get('year_level', ''),
                                      data.get('curriculum_code', ''))

    # Differentiation
    diff_html = build_diff_grid(data.get('eal_strategies', []),
                                 data.get('gifted_strategies', []),
                                 data.get('nep_strategies', []))

    # Footer
    footer_html = f'''  <footer class="page-footer">
    <p>PickleNickAI — Sample Unit Output</p>
    <p>{data.get('curriculum_code', '')} | WA Schools | {data.get('year_level', '')}</p>
    <p>Mentor Text: <em>{data.get('mentor_text', '')}</em></p>
  </footer>'''

    # Replace container
    container_replace = f'''
  <!-- META GRID -->
  {meta_grid}

  <!-- SUCCESS CRITERIA -->
  {criteria_html}

  <!-- COLD TASK -->
  {cold_task_html}

  <!-- WEEK SUMMARY -->
  {weekly_summary_html}

  <!-- HOT TASK -->
  {hot_task_html}

  <!-- WEEKS -->
  {weeks_content_html}

  <!-- RUBRIC -->
  {rubric_html}

  <!-- DIFFERENTIATION -->
  {diff_html}

  <!-- FOOTER -->
  {footer_html}
'''

    # Find and replace the container div
    html = html.replace('<!-- ========================', '<!--')
    html = html.replace('======================== -->\n', '')

    # Replace meta grid placeholder
    html = re.sub(r'<!-- =+\s*\n\s*META GRID\s*\n\s*=-+\s*-->.*?<!-- =-+\s*-->',
                  meta_grid, html, flags=re.DOTALL)

    # We need to rebuild the whole body section
    # Instead, let's just construct the full page
    full_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{data.get('title', 'Unit Plan')} | PickleNickAI</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>

<header class="page-header">
  <div class="page-header__inner">
    <div class="page-header__meta">
      <span class="badge badge--subject">{data.get('subject', '')}</span>
      <span class="badge badge--level">{data.get('year_level', '')}</span>
      <span class="badge badge--weeks">{data.get('weeks', '')} Weeks</span>
      <span class="badge badge--lessons">{data.get('lessons', '')} Lessons</span>
    </div>
    <h1 class="page-header__title">{data.get('title', '')}</h1>
    <p class="page-header__subtitle">{data.get('subtitle', '') or data.get('focus_area', '')}</p>
    <div class="page-header__mentor">
      <strong>Mentor Text:</strong> <em>{data.get('mentor_text', '')}</em>
    </div>
  </div>
</header>

<div class="container">
  {meta_grid}

  {criteria_html}

  {cold_task_html}

  {weekly_summary_html}

  {hot_task_html}

  {weeks_content_html}

  {rubric_html}

  {diff_html}

  {footer_html}
</div>

</body>
</html>'''

    # Write to file
    with open(html_path, 'w') as f:
        f.write(full_html)

    print(f"Created: {html_path}")
    return html_path


def extract_book_title(mentor_text):
    """Extract book title from mentor text."""
    if not mentor_text:
        return ''
    # Look for text in * *
    m = re.search(r'\*(.+?)\*', mentor_text)
    if m:
        return m.group(1)
    return mentor_text


def extract_book_desc(mentor_text):
    """Extract book description from mentor text."""
    if not mentor_text:
        return ''
    # Look for text after *title* by author
    m = re.search(r'\*[^*]+\*\s*by\s*([^(]+)', mentor_text)
    if m:
        return m.group(1).strip()
    # Look for anything after the title in *
    parts = mentor_text.split('*')
    if len(parts) >= 4:
        return parts[2] + ' — ' + parts[3].strip()
    return ''


if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for md_file, html_file, subject, year_level, weeks, lessons in files:
        md_path = os.path.join(UNITS_DIR, md_file)
        if os.path.exists(md_path):
            convert_file(md_file, html_file, subject, year_level, weeks, lessons)
        else:
            print(f"Missing: {md_path}")