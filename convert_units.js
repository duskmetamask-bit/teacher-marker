#!/usr/bin/env node
/**
 * PickleNickAI — Markdown to HTML Unit Converter
 */

const fs = require('fs');
const path = require('path');

const BASE_TEMPLATE_PATH = "/home/dusk/.openclaw/vault/dawn-vault/shared/PROJECTS/pickle-nick-ai/design-system/base-template.html";
const STYLES_CSS_PATH = "/home/dusk/.openclaw/vault/dawn-vault/shared/PROJECTS/pickle-nick-ai/design-system/styles.css";
const UNITS_DIR = "/home/dusk/pickle-nick-ai/data/units";
const OUTPUT_DIR = "/home/dusk/pickle-nick-ai/public/units";
const REPO_DIR = "/home/dusk/pickle-nick-ai";

// Unit file definitions: [mdFile, htmlFile, subject, yearLevel, weeks, lessons]
const FILES = [
  ["reading-comprehension-F.md", "reading-comprehension-F.html", "English", "Foundation", 8, 24],
  ["reading-comprehension-Y1.md", "reading-comprehension-Y1.html", "English", "Year 1", 8, 24],
  ["reading-comprehension-Y2.md", "reading-comprehension-Y2.html", "English", "Year 2", 8, 24],
  ["reading-comprehension-Y3.md", "reading-comprehension-Y3.html", "English", "Year 3", 8, 24],
  ["reading-comprehension-Y4.md", "reading-comprehension-Y4.html", "English", "Year 4", 8, 24],
  ["hass-geography-F.md", "hass-geography-F.html", "HASS/Geography", "Foundation", 7, 21],
  ["hass-geography-Y1.md", "hass-geography-Y1.html", "HASS/Geography", "Year 1", 7, 21],
  ["hass-geography-Y2.md", "hass-geography-Y2.html", "HASS/Geography", "Year 2", 7, 21],
  ["hass-geography-Y3.md", "hass-geography-Y3.html", "HASS/Geography", "Year 3", 7, 21],
  ["hass-geography-Y4.md", "hass-geography-Y4.html", "HASS/Geography", "Year 4", 7, 21],
  ["hass-geography-Y5.md", "hass-geography-Y5.html", "HASS/Geography", "Year 5", 7, 21],
  ["science-physical-F.md", "science-physical-F.html", "Science", "Foundation", 6, 18],
  ["science-physical-Y1.md", "science-physical-Y1.html", "Science", "Year 1", 6, 18],
  ["science-physical-Y2.md", "science-physical-Y2.html", "Science", "Year 2", 6, 18],
];

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseMarkdownFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');

  const data = {
    title: '',
    subject: '',
    yearLevel: '',
    weeks: 8,
    lessons: 24,
    subtitle: '',
    mentorText: '',
    curriculumCode: '',
    focusArea: '',
    teachingModel: '5E Model',
    coldTaskWeek: 'Week 1',
    coldTaskLesson: 'Lesson 1',
    coldTaskDesc: '',
    hotTaskWeek: 'Week 8',
    hotTaskLesson: 'Lesson 1',
    hotTaskDesc: '',
    learningIntention: '',
    successCriteria: [],
    weeklySummary: [],
    weeksContent: [],
    rubricRows: [],
    ealStrategies: [],
    giftedStrategies: [],
    nepStrategies: [],
  };

  // Parse top metadata
  lines.forEach((line, i) => {
    line = line.trim();

    // Unit title
    const titleMatch = line.match(/^#\s+(.+?)\s+[–\-]\s+\w+$/);
    if (titleMatch) {
      data.title = titleMatch[1];
    }

    if (line.includes('**Unit Duration:**')) {
      const wMatch = line.match(/(\d+)\s*weeks/);
      const lMatch = line.match(/(\d+)\s*lessons/);
      if (wMatch) data.weeks = parseInt(wMatch[1]);
      if (lMatch) data.lessons = parseInt(lMatch[1]);
    }

    if (line.includes('**Year Level:**')) {
      const m = line.match(/\*\*Year Level:\*\*\s*(.+)/);
      if (m) data.yearLevel = m[1].trim();
    }

    if (line.includes('**Curriculum Link:**')) {
      const m = line.match(/\*\*Curriculum Link:\*\*\s*(.+)/);
      if (m) data.curriculumCode = m[1].trim();
    }

    if (line.includes('**Focus:**')) {
      const m = line.match(/\*\*Focus:\*\*\s*(.+)/);
      if (m) data.focusArea = m[1].trim();
    }

    if (line.includes('**Mentor Text:**')) {
      const m = line.match(/\*\*Mentor Text:\*\*\s*(.+)/);
      if (m) data.mentorText = m[1].trim();
    }

    if (line.includes('**Cold Task:**')) {
      const m = line.match(/Week\s+(\d+),\s+Lesson\s+(\d+)/);
      if (m) {
        data.coldTaskWeek = `Week ${m[1]}`;
        data.coldTaskLesson = `Lesson ${m[2]}`;
      }
      const m2 = line.match(/—\s*(.+)/);
      if (m2) data.coldTaskDesc = m2[1].trim();
    }

    if (line.includes('**Hot Task:**')) {
      const m = line.match(/Week\s+(\d+),\s+Lesson\s+(\d+)/);
      if (m) {
        data.hotTaskWeek = `Week ${m[1]}`;
        data.hotTaskLesson = `Lesson ${m[2]}`;
      }
      const m2 = line.match(/—\s*(.+)/);
      if (m2) data.hotTaskDesc = m2[1].trim();
    }
  });

  // Unit Big Idea (subtitle)
  const bigIdeaMatch = content.match(/\*\*Unit Big Idea:\*\*\s*(.+)/);
  if (bigIdeaMatch) data.subtitle = bigIdeaMatch[1].trim();

  // Learning Intention
  const liMatch = content.match(/\*\*Learning Intention:\*\*\s*(?:We are learning to\s*)?(.+)/);
  if (liMatch) data.learningIntention = liMatch[1].trim();

  // Success Criteria
  const scMatch = content.match(/\*\*Success Criteria:\*\*\n((?:\s*-\s*.+\n)+)/);
  if (scMatch) {
    const scText = scMatch[1];
    data.successCriteria = scText.match(/(?:^|\n)\s*-\s*(.+)/g).map(s => s.replace(/^\s*-\s*/, '').trim());
  }

  // Teaching model
  if (content.includes('Gradual Release')) {
    data.teachingModel = 'Gradual Release Model';
  } else if (content.includes('5E')) {
    data.teachingModel = '5E Model';
  }

  // Weekly Summary table
  const wsMatch = content.match(/\*\*Weekly Summary\*\*\s*\n((?:\|.+\|\n)+)/);
  if (wsMatch) {
    const tableLines = wsMatch[1].trim().split('\n').filter(l => !l.match(/^\|[-:\s]+\|$/));
    tableLines.forEach(row => {
      const cols = row.split('|').slice(1, -1).map(c => c.trim());
      if (cols.length >= 4) {
        data.weeklySummary.push({
          week: cols[0],
          focus: cols[1],
          lessons: cols[2],
          highlights: cols[3],
        });
      }
    });
  }

  // Parse weeks and lessons
  const weekPattern = /^##\s+WEEK\s+(\d+)\s+[—\-]\s+(.+)$/i;
  const lessonPattern = /^###\s+Lesson\s+(\d+):\s+(.+)$/i;
  const timeTypePattern = /\*\*Time:\*\*\s*(\d+)\s*minutes?\s*\|\s*\*\*Type:\*\*\s*(.+)/i;
  const phasePattern = /\|(.+?)\|(.+?)\|(.+?)\|/;

  let currentWeek = null;
  let currentLesson = null;

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    const wkMatch = trimmed.match(weekPattern);
    if (wkMatch) {
      const wkNum = wkMatch[1];
      const focus = wkMatch[2].trim();
      currentWeek = { focus, lessons: [] };
      data.weeksContent.push(currentWeek);
      return;
    }

    const lesMatch = trimmed.match(lessonPattern);
    if (lesMatch && currentWeek) {
      const lessonNum = lesMatch[1];
      const lessonTitle = lesMatch[2].trim();

      // Check next lines for time/type
      let time = '', type = 'Explicit Teaching';
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();
        const ttMatch = nextLine.match(timeTypePattern);
        if (ttMatch) {
          time = ttMatch[1] + ' min';
          type = ttMatch[2].trim();
          break;
        }
        if (nextLine.startsWith('|') || nextLine.startsWith('#') || nextLine === '---') break;
      }

      currentLesson = { number: lessonNum, title: lessonTitle, time, type, phases: [], diff: '' };
      currentWeek.lessons.push(currentLesson);
      return;
    }

    // Phase table rows
    if (currentLesson && trimmed.startsWith('|') && !trimmed.match(/^\|[-:\s]+\|$/)) {
      // Skip header row (contains Phase|Teacher|Students)
      if (trimmed.includes('Phase') && trimmed.includes('Teacher')) return;

      const cols = trimmed.split('|').slice(1, -1).map(c => c.trim());
      if (cols.length >= 3) {
        // Check it's not a rubric row (has A,B,C,D,E)
        if (cols[0] && !cols[0].match(/^[A-E]$/)) {
          const phaseName = cols[0].replace(/\s*\(\d+\s*min\)\s*/g, '').trim();
          const timeM = cols[0].match(/\((\d+)\s*min\)/);
          const phaseTime = timeM ? timeM[1] + ' min' : '';
          currentLesson.phases.push({
            name: phaseName,
            teacher: cols[1] || '',
            students: cols[2] || '',
            time: phaseTime,
          });
        }
      }
    }

    // Differentiation note
    if (currentLesson && trimmed.includes('**Differentiation')) {
      const m = trimmed.match(/\*\*Differentiation:\*\*\s*(.+)/);
      if (m) {
        currentLesson.diff = (currentLesson.diff ? currentLesson.diff + ' ' : '') + m[1].trim();
      }
    }
  });

  // Rubric (from end of content)
  const rubricSection = content.match(/##\s+Rubric[\s\S]*?\n((?:\|[^|\n]+\|)+\n?)/);
  if (rubricSection) {
    const rows = rubricSection[1].split('\n').filter(r => r.trim() && !r.match(/^\|[-:\s]+\|$/) && r.includes('|'));
    rows.forEach(row => {
      const cols = row.split('|').slice(1, -1).map(c => c.trim());
      if (cols.length >= 5) {
        data.rubricRows.push(cols);
      }
    });
  }

  // If no rubric found via section, try inline
  if (data.rubricRows.length === 0) {
    const rubricMatch = content.match(/\*\*Rubric Criteria \((.+?)\):\*\*(?:\s*\n)((?:\|.+\|\n)+)/);
    if (rubricMatch) {
      const tableLines = rubricMatch[2].trim().split('\n').filter(l => !l.match(/^\|[-:\s]+\|$/));
      tableLines.forEach(row => {
        const cols = row.split('|').slice(1, -1).map(c => c.trim());
        if (cols.length >= 5) {
          data.rubricRows.push(cols);
        }
      });
    }
  }

  // Differentiation section
  const diffSection = content.match(/##\s+Differentiation[\s\S]*?(?=\n##|\n#|$)/i);
  if (diffSection) {
    const diffText = diffSection[0];

    const ealMatch = diffText.match(/\*\*EAL Learners:\*\*\s*\n((?:\s*-\s*.+\n)+)/i);
    if (ealMatch) {
      data.ealStrategies = ealMatch[1].match(/- (.+)/g).map(s => s.replace(/^-\s*/, '').trim());
    }
    const giftedMatch = diffText.match(/\*\*Gifted[^:]*:\*\*\s*\n((?:\s*-\s*.+\n)+)/i);
    if (giftedMatch) {
      data.giftedStrategies = giftedMatch[1].match(/- (.+)/g).map(s => s.replace(/^-\s*/, '').trim());
    }
    const nepMatch = diffText.match(/\*\*Students with NEPs:\*\*\s*\n((?:\s*-\s*.+\n)+)/i);
    if (nepMatch) {
      data.nepStrategies = nepMatch[1].match(/- (.+)/g).map(s => s.replace(/^-\s*/, '').trim());
    }
  }

  return data;
}

function buildMetaGrid(data) {
  return `<div class="meta-grid">
    <div class="meta-item">
      <div class="meta-item__label">Curriculum</div>
      <div class="meta-item__value">${escapeHtml(data.curriculumCode)}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Focus</div>
      <div class="meta-item__value">${escapeHtml(data.focusArea)}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Teaching Model</div>
      <div class="meta-item__value">${escapeHtml(data.teachingModel)}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Cold Task</div>
      <div class="meta-item__value">${escapeHtml(data.coldTaskWeek)}, ${escapeHtml(data.coldTaskLesson)}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Hot Task</div>
      <div class="meta-item__value">${escapeHtml(data.hotTaskWeek)}, ${escapeHtml(data.hotTaskLesson)}</div>
    </div>
    <div class="meta-item">
      <div class="meta-item__label">Year Level</div>
      <div class="meta-item__value">${escapeHtml(data.yearLevel)}</div>
    </div>
  </div>`;
}

function buildCriteriaBlock(data) {
  const scItems = data.successCriteria.map(sc => `<li class="criteria-list__item">${escapeHtml(sc)}</li>`).join('\n');
  return `<div class="criteria-block">
    <div class="criteria-block__header">
      <span class="criteria-block__label">Learning Intention</span>
    </div>
    <h2 class="criteria-block__title">We are learning to ${escapeHtml(data.learningIntention)}.</h2>
    <ul class="criteria-list">
${scItems}
    </ul>
  </div>`;
}

function buildTaskCard(taskType, data) {
  const week = taskType === 'cold' ? data.coldTaskWeek : data.hotTaskWeek;
  const lesson = taskType === 'cold' ? data.coldTaskLesson : data.hotTaskLesson;
  const desc = taskType === 'cold' ? data.coldTaskDesc : data.hotTaskDesc;
  const label = taskType === 'cold' ? 'Pre-Assessment — Cold Task' : 'Post-Assessment — Hot Task';
  const sameNote = taskType === 'cold'
    ? `Same task as Hot Task (${week})`
    : `Same task as Cold Task (${week}) — measure growth`;

  return `<div class="task-card task-card--${taskType}">
    <div class="task-card__label">${label}</div>
    <div class="task-card__title">${escapeHtml(week)}, ${escapeHtml(lesson)}</div>
    <p class="task-card__desc">${escapeHtml(desc)}</p>
    <div class="task-card__meta">
      <span class="task-card__tag task-card__tag--time">30 min</span>
      <span class="task-card__tag">${escapeHtml(sameNote)}</span>
    </div>
  </div>`;
}

function buildWeekSummaryTable(weeklySummary) {
  const numWeeks = weeklySummary.length;
  let html = `<div class="week-summary">
    <h2>${numWeeks}-Week Overview</h2>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr><th>Week</th><th>Focus</th><th>Lessons</th><th>Highlights</th></tr>
        </thead>
        <tbody>
`;

  weeklySummary.forEach(row => {
    // Build lesson tags from lessons string like "1: Cold Task / 2: Reading / 3: Who What Where"
    const lessonParts = row.lessons.split('/').map(p => {
      const num = p.trim().split(':')[0].trim();
      return `<span class="lesson-tag">Lesson ${num}</span>`;
    }).join('\n              ');

    html += `          <tr>
            <td class="week-num">${escapeHtml(row.week)}</td>
            <td class="week-focus">${escapeHtml(row.focus)}</td>
            <td><div class="lesson-tags">              ${lessonParts}
            </div></td>
            <td>${escapeHtml(row.highlights)}</td>
          </tr>
`;
  });

  html += `        </tbody>
      </table>
    </div>
  </div>`;

  return html;
}

function buildWeekSection(weekData, weekNum) {
  const typeClassMap = {
    'explicit teaching': 'explicit',
    'i do': 'explicit',
    'guided practice': 'guided',
    'we do': 'guided',
    'independent practice': 'independent',
    'you do': 'independent',
    'assessment': 'assessment',
  };

  let html = `<section class="week-section">
    <div class="week-header">
      <h3 class="week-header__title">Week ${weekNum} — ${escapeHtml(weekData.focus)}</h3>
    </div>
    <div class="week-body">
`;

  weekData.lessons.forEach(lesson => {
    const typeLower = lesson.type.toLowerCase();
    let typeClass = 'explicit';
    for (const [key, val] of Object.entries(typeClassMap)) {
      if (typeLower.includes(key)) { typeClass = val; break; }
    }

    html += `      <div class="lesson-card">
        <div class="lesson-card__header">
          <h4 class="lesson-card__title">Lesson ${lesson.number}: ${escapeHtml(lesson.title)}</h4>
          <div class="lesson-card__meta">
            ${lesson.time ? `<span class="lesson-card__time">${escapeHtml(lesson.time)}</span>` : ''}
            <span class="lesson-card__type lesson-card__type--${typeClass}">${escapeHtml(lesson.type)}</span>
          </div>
        </div>
`;

    if (lesson.phases.length > 0) {
      html += `        <table class="lesson-table">
          <thead>
            <tr><th>Phase</th><th>Teacher (I Do)</th><th>Students</th></tr>
          </thead>
          <tbody>
`;
      lesson.phases.forEach(phase => {
        const timeStr = phase.time ? ` <em>(${escapeHtml(phase.time)})</em>` : '';
        html += `            <tr>
              <td>${escapeHtml(phase.name)}${timeStr}</td>
              <td>${escapeHtml(phase.teacher)}</td>
              <td>${escapeHtml(phase.students)}</td>
            </tr>
`;
      });
      html += `          </tbody>
        </table>
`;
    }

    if (lesson.diff) {
      html += `        <div class="lesson-card__diff"><strong>Differentiation</strong>${escapeHtml(lesson.diff)}</div>\n`;
    }

    html += `      </div>
`;
  });

  html += `    </div>
  </section>
`;

  return html;
}

function buildRubricBlock(data) {
  if (data.rubricRows.length === 0) return '';

  let html = `<div class="rubric-block">
    <h3 class="rubric-block__title">Rubric — ${escapeHtml(data.title)} (${escapeHtml(data.yearLevel)})</h3>
    <p class="rubric-block__sub">${escapeHtml(data.curriculumCode)}</p>
    <div class="table-wrapper">
      <table class="rubric-table">
        <thead>
          <tr><th>Criterion</th><th class="grade-a">A</th><th class="grade-b">B</th><th class="grade-c">C</th><th class="grade-d">D</th><th class="grade-e">E</th></tr>
        </thead>
        <tbody>
`;

  data.rubricRows.forEach(row => {
    html += `          <tr>
            <td>${escapeHtml(row[0] || '')}</td>
            <td class="grade-a">${escapeHtml(row[1] || '')}</td>
            <td class="grade-b">${escapeHtml(row[2] || '')}</td>
            <td class="grade-c">${escapeHtml(row[3] || '')}</td>
            <td class="grade-d">${escapeHtml(row[4] || '')}</td>
            <td class="grade-e">${escapeHtml(row[5] || '')}</td>
          </tr>
`;
  });

  html += `        </tbody>
      </table>
    </div>
  </div>`;

  return html;
}

function buildDiffGrid(data) {
  const { ealStrategies, giftedStrategies, nepStrategies } = data;
  if (!ealStrategies.length && !giftedStrategies.length && !nepStrategies.length) return '';

  let html = '<div class="diff-grid">\n';

  if (ealStrategies.length) {
    html += '  <div class="diff-card diff-card--eal"><h4>EAL Learners</h4><ul>\n';
    ealStrategies.forEach(s => { html += `    <li>${escapeHtml(s)}</li>\n`; });
    html += '  </ul></div>\n';
  }

  if (giftedStrategies.length) {
    html += '  <div class="diff-card diff-card--gifted"><h4>Gifted &amp; Talented</h4><ul>\n';
    giftedStrategies.forEach(s => { html += `    <li>${escapeHtml(s)}</li>\n`; });
    html += '  </ul></div>\n';
  }

  if (nepStrategies.length) {
    html += '  <div class="diff-card diff-card--nep"><h4>Students with NEPs</h4><ul>\n';
    nepStrategies.forEach(s => { html += `    <li>${escapeHtml(s)}</li>\n`; });
    html += '  </ul></div>\n';
  }

  html += '</div>\n';
  return html;
}

function extractMentorTitle(mentorText) {
  if (!mentorText) return '';
  const m = mentorText.match(/\*([^*]+)\*/);
  return m ? m[1] : mentorText;
}

function buildFooter(data) {
  return `<footer class="page-footer">
    <p>PickleNickAI — Sample Unit Output</p>
    <p>${escapeHtml(data.curriculumCode)} | WA Schools | ${escapeHtml(data.yearLevel)}</p>
    <p>Mentor Text: <em>${escapeHtml(data.mentorText)}</em></p>
  </footer>`;
}

function convertFile(mdFile, htmlFile, subject, yearLevel, weeks, lessons) {
  const mdPath = path.join(UNITS_DIR, mdFile);
  const htmlPath = path.join(OUTPUT_DIR, htmlFile);

  if (!fs.existsSync(mdPath)) {
    console.log(`MISSING: ${mdPath}`);
    return;
  }

  const data = parseMarkdownFile(mdPath);

  // Override with provided metadata
  if (subject) data.subject = subject;
  if (yearLevel) data.yearLevel = yearLevel;
  if (weeks) data.weeks = weeks;
  if (lessons) data.lessons = lessons;

  const metaGrid = buildMetaGrid(data);
  const criteriaBlock = buildCriteriaBlock(data);
  const coldTask = buildTaskCard('cold', data);
  const weekSummary = buildWeekSummaryTable(data.weeklySummary);
  const hotTask = buildTaskCard('hot', data);

  let weeksContent = '';
  data.weeksContent.forEach((wk, i) => {
    weeksContent += buildWeekSection(wk, i + 1);
  });

  const rubric = buildRubricBlock(data);
  const diffGrid = buildDiffGrid(data);
  const footer = buildFooter(data);

  const mentorTitle = extractMentorTitle(data.mentorText);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(data.title)} | PickleNickAI</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>

<header class="page-header">
  <div class="page-header__inner">
    <div class="page-header__meta">
      <span class="badge badge--subject">${escapeHtml(data.subject)}</span>
      <span class="badge badge--level">${escapeHtml(data.yearLevel)}</span>
      <span class="badge badge--weeks">${data.weeks} Weeks</span>
      <span class="badge badge--lessons">${data.lessons} Lessons</span>
    </div>
    <h1 class="page-header__title">${escapeHtml(data.title)}</h1>
    <p class="page-header__subtitle">${escapeHtml(data.subtitle || data.focusArea)}</p>
    <div class="page-header__mentor">
      <strong>Mentor Text:</strong> <em>${escapeHtml(data.mentorText)}</em>
    </div>
  </div>
</header>

<div class="container">

  ${metaGrid}

  ${criteriaBlock}

  ${coldTask}

  ${weekSummary}

  ${hotTask}

  ${weeksContent}

  ${rubric}

  ${diffGrid}

  ${footer}

</div>

</body>
</html>`;

  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`Created: ${htmlPath}`);
  return htmlPath;
}

// Run
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

FILES.forEach(([mdFile, htmlFile, subject, yearLevel, weeks, lessons]) => {
  convertFile(mdFile, htmlFile, subject, yearLevel, weeks, lessons);
});

console.log('\nAll done!');