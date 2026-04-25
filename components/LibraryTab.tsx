"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { C, radius, shadows, SUBJECT_COLORS } from "@/lib/design";

// ─── Curated Sample Units ───────────────────────────────────────────
interface SampleUnit {
  id: string;
  title: string;
  yearLevel: string;
  subject: string;
  description: string;
  url: string;
  weeks: number;
  lessons: number;
}

const SAMPLE_UNITS: SampleUnit[] = [
  {
    id: "sample-narrative",
    title: "Narrative Writing — Leo and Ralph",
    yearLevel: "Years 3–4",
    subject: "English",
    description: "8-week narrative writing unit using *Leo and Ralph* by Peter Carnavas. Students explore friendship, belonging and identity through the Gradual Release model.",
    url: "/units/leo-ralph-narrative-unit.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "sample-ecosystems",
    title: "Ecosystems and Living Things",
    yearLevel: "Years 3–4",
    subject: "Science",
    description: "8-week science unit exploring ecosystems, food chains and Australian environments through *The Lorax*. 24 lessons using the 5E model.",
    url: "/units/ecosystems-science-unit.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "sample-hass",
    title: "Changes in Community and Country",
    yearLevel: "Years 3–4",
    subject: "HASS",
    description: "8-week HASS unit examining how Australia has changed over time using *The Rabbits* by John Marsden and Shaun Tan. Covers history and geography.",
    url: "/units/hass-changes-community-unit.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "sample-fractions",
    title: "Fractions and Decimals",
    yearLevel: "Years 3–4",
    subject: "Mathematics",
    description: "8-week mathematics unit on fractions and decimals using *The Doorbell Rang* by Pat Hutchins. CPA approach with 5E model, AC9 aligned.",
    url: "/units/maths-fractions-unit.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "sample-persuasive",
    title: "Persuasive Writing — The Rabbits",
    yearLevel: "Years 5–6",
    subject: "English",
    description: "8-week persuasive writing unit analysing author's viewpoint and bias in *The Rabbits*, then applying rhetorical devices to students' own arguments.",
    url: "/units/persuasive-writing-unit.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "reading-comprehension-F",
    title: "Reading Comprehension — Foundation",
    yearLevel: "Foundation",
    subject: "English",
    description: "8-week reading comprehension unit using *The Gruffalo*. Students retell stories, identify characters, explore settings, and make text-to-self connections.",
    url: "/units/reading-comprehension-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "reading-comprehension-Y1",
    title: "Reading Comprehension — Year 1",
    yearLevel: "Year 1",
    subject: "English",
    description: "8-week reading comprehension unit building literal understanding, inferential reasoning, and text connections using picture books and short texts.",
    url: "/units/reading-comprehension-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "reading-comprehension-Y2",
    title: "Reading Comprehension — Year 2",
    yearLevel: "Year 2",
    subject: "English",
    description: "8-week reading comprehension unit developing vocabulary, literal and inferential comprehension, and compare-and-contrast skills across texts.",
    url: "/units/reading-comprehension-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "reading-comprehension-Y3",
    title: "Reading Comprehension — Year 3",
    yearLevel: "Year 3",
    subject: "English",
    description: "8-week reading comprehension unit using *The Gruffalo* and short texts. Focus on summarising, making connections, and author's purpose.",
    url: "/units/reading-comprehension-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "reading-comprehension-Y4",
    title: "Reading Comprehension — Year 4",
    yearLevel: "Year 4",
    subject: "English",
    description: "8-week reading comprehension unit developing deeper inferential reasoning, vocabulary strategies, and text analysis skills across fiction and nonfiction.",
    url: "/units/reading-comprehension-Y4.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-geography-F",
    title: "Geography — Foundation",
    yearLevel: "Foundation",
    subject: "HASS",
    description: "7-week geography unit exploring places children know — home, school, neighbourhood. Uses inquiry skills: locate, explore, investigate, process, communicate.",
    url: "/units/hass-geography-F.html",
    weeks: 7,
    lessons: 21,
  },
  {
    id: "hass-geography-Y1",
    title: "Geography — Year 1",
    yearLevel: "Year 1",
    subject: "HASS",
    description: "8-week geography unit exploring places near and far. Students describe features of different places, locate countries on maps, and explain similarities and differences.",
    url: "/units/hass-geography-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-geography-Y2",
    title: "Geography — Year 2",
    yearLevel: "Year 2",
    subject: "HASS",
    description: "8-week geography unit examining how people's lives are shaped by place features. Students compare how people in different places meet their needs.",
    url: "/units/hass-geography-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-geography-Y3",
    title: "Geography — Year 3",
    yearLevel: "Year 3",
    subject: "HASS",
    description: "8-week geography unit examining climate and natural vegetation of places in Australia and Asia. AC9HC aligned, inquiry-based unit.",
    url: "/units/hass-geography-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-geography-Y4",
    title: "Geography — Year 4",
    yearLevel: "Year 4",
    subject: "HASS",
    description: "8-week geography unit exploring how spaces are organised and used. Students investigate environmental challenges and propose solutions.",
    url: "/units/hass-geography-Y4.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-geography-Y5",
    title: "Geography — Year 5",
    yearLevel: "Year 5",
    subject: "HASS",
    description: "8-week geography unit investigating global connections through trade, migration, and culture. AC9HG aligned.",
    url: "/units/hass-geography-Y5.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-physical-F",
    title: "Physical Sciences — Foundation",
    yearLevel: "Foundation",
    subject: "Science",
    description: "6-week physical sciences unit exploring properties and changes. Students investigate size, texture, hardness, pushes, pulls, twisting, and folding.",
    url: "/units/science-physical-F.html",
    weeks: 6,
    lessons: 18,
  },
  {
    id: "science-physical-Y1",
    title: "Physical Sciences — Year 1",
    yearLevel: "Year 1",
    subject: "Science",
    description: "8-week physical sciences unit on observable changes. Students explore light and sound, investigating how light sources work and how sounds are made.",
    url: "/units/science-physical-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-physical-Y2",
    title: "Physical Sciences — Year 2",
    yearLevel: "Year 2",
    subject: "Science",
    description: "8-week physical sciences unit on energy and movement. Students investigate how energy transfers between forms through light, sound, and heat.",
    url: "/units/science-physical-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-physical-Y3",
    title: "Physical Sciences — Year 3",
    yearLevel: "Year 3",
    subject: "Science",
    description: "8-week physical sciences unit on forces and motion. Students investigate gravity, friction, magnetic forces, and design fair tests.",
    url: "/units/science-physical-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-physical-Y4",
    title: "Physical Sciences — Year 4",
    yearLevel: "Year 4",
    subject: "Science",
    description: "8-week physical sciences unit on energy transfer and transformation. Students explore light, sound, heat, and electrical energy through hands-on investigations.",
    url: "/units/science-physical-Y4.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "reading-comprehension-Y5",
    title: "Reading Comprehension — Year 5",
    yearLevel: "Year 5",
    subject: "English",
    description: "8-week reading comprehension unit developing inferential reasoning, author's craft, and text analysis across narrative and informational texts.",
    url: "/units/reading-comprehension-Y5.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "reading-comprehension-Y6",
    title: "Reading Comprehension — Year 6",
    yearLevel: "Year 6",
    subject: "English",
    description: "8-week reading comprehension unit building critical literacy, evaluative reasoning, and sophisticated text analysis skills for senior primary students.",
    url: "/units/reading-comprehension-Y6.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-history-F",
    title: "History — Foundation",
    yearLevel: "Foundation",
    subject: "HASS",
    description: "8-week history unit exploring family and community histories. Students investigate changes and continuities in their own lives using personal photographs and stories.",
    url: "/units/hass-history-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-history-Y1",
    title: "History — Year 1",
    yearLevel: "Year 1",
    subject: "HASS",
    description: "8-week history unit examining daily life in the past and present. Students compare their own experiences with those of family members and describe how things have changed.",
    url: "/units/hass-history-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-history-Y2",
    title: "History — Year 2",
    yearLevel: "Year 2",
    subject: "HASS",
    description: "8-week history unit exploring significant events and people in the local community and Australia. Students develop inquiry skills through primary and secondary sources.",
    url: "/units/hass-history-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-history-Y3",
    title: "History — Year 3",
    yearLevel: "Year 3",
    subject: "HASS",
    description: "8-week history unit on ancient Australia and early settlement. Students investigate the deep history of Aboriginal and Torres Strait Islander peoples and first contact.",
    url: "/units/hass-history-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-history-Y4",
    title: "History — Year 4",
    yearLevel: "Year 4",
    subject: "HASS",
    description: "8-week history unit examining the role of explorers and early settlers in Australian history. Students explore cause and effect, perspectives, and source analysis.",
    url: "/units/hass-history-Y4.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "grammar-punctuation-F",
    title: "Grammar and Punctuation — Foundation",
    yearLevel: "Foundation",
    subject: "English",
    description: "8-week grammar and punctuation unit for Foundation students. Focus on sentence construction, using capital letters, full stops, and describing words.",
    url: "/units/grammar-punctuation-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "grammar-punctuation-Y1",
    title: "Grammar and Punctuation — Year 1",
    yearLevel: "Year 1",
    subject: "English",
    description: "8-week grammar and punctuation unit developing sentence skills, proper nouns, verbs, and the use of question marks, exclamation marks, and commas.",
    url: "/units/grammar-punctuation-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "grammar-punctuation-Y2",
    title: "Grammar and Punctuation — Year 2",
    yearLevel: "Year 2",
    subject: "English",
    description: "8-week grammar and punctuation unit on compound sentences, apostrophes for contraction, adjectives, and extended punctuation including colons and speech marks.",
    url: "/units/grammar-punctuation-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-addition-subtraction-F",
    title: "Addition and Subtraction — Foundation",
    yearLevel: "Foundation",
    subject: "Mathematics",
    description: "8-week maths unit on early addition and subtraction within 10. Students use counters, ten frames, and number lines to model combining and taking away.",
    url: "/units/maths-addition-subtraction-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-addition-subtraction-Y1",
    title: "Addition and Subtraction — Year 1",
    yearLevel: "Year 1",
    subject: "Mathematics",
    description: "8-week maths unit on addition and subtraction to 20 and beyond. Students use jump, split, and bridge strategies with ten frames, number lines, and part-part-whole models.",
    url: "/units/maths-addition-subtraction-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-biological-F",
    title: "Biological Sciences — Foundation",
    yearLevel: "Foundation",
    subject: "Science",
    description: "8-week biological sciences unit exploring living things. Students identify features of plants and animals, describe how they grow and change, and care for a class garden.",
    url: "/units/science-biological-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-physical-Y5",
    title: "Physical Sciences — Year 5",
    yearLevel: "Year 5",
    subject: "Science",
    description: "8-week physical sciences unit on energy and change. Students investigate electrical circuits, renewable and non-renewable energy sources, and design solutions for real-world problems.",
    url: "/units/science-physical-Y5.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-physical-Y6",
    title: "Physical Sciences — Year 6",
    yearLevel: "Year 6",
    subject: "Science",
    description: "8-week physical sciences unit on forces and fields. Students investigate gravity, magnetism, static electricity, and construct explanations using scientific evidence.",
    url: "/units/science-physical-Y6.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-geography-Y6",
    title: "Geography — Year 6",
    yearLevel: "Year 6",
    subject: "HASS",
    description: "8-week geography unit investigating global sustainability challenges. Students examine environmental, social, and economic impacts and propose community action strategies.",
    url: "/units/hass-geography-Y6.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-addition-subtraction-Y2",
    title: "Addition and Subtraction — Year 2",
    yearLevel: "Year 2",
    subject: "Mathematics",
    description: "8-week maths unit on addition and subtraction within 100. Students use efficient strategies including jump, split, and bridging to ten with 2-digit numbers.",
    url: "/units/maths-addition-subtraction-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-addition-subtraction-Y3",
    title: "Addition and Subtraction — Year 3",
    yearLevel: "Year 3",
    subject: "Mathematics",
    description: "8-week maths unit on addition and subtraction of 3-digit numbers. Students apply formal algorithms, estimation, and inverse operations to solve problems.",
    url: "/units/maths-addition-subtraction-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
  {
    id: "maths-addition-subtraction-Y4",
    title: "Addition and Subtraction — Year 4",
    yearLevel: "Year 4",
    subject: "Mathematics",
    description: "8-week maths unit on addition and subtraction of 4-digit numbers. Students use formal algorithms, estimation, and inverse operations to solve multi-step problems.",
    url: "/units/maths-addition-subtraction-Y4.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-addition-subtraction-Y5",
    title: "Addition and Subtraction — Year 5",
    yearLevel: "Year 5",
    subject: "Mathematics",
    description: "8-week maths unit on addition and subtraction of decimals and whole numbers. Students apply estimation, inverse operations, and mental strategies to solve problems across contexts.",
    url: "/units/maths-addition-subtraction-Y5.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-addition-subtraction-Y6",
    title: "Addition and Subtraction — Year 6",
    yearLevel: "Year 6",
    subject: "Mathematics",
    description: "8-week maths unit on addition, subtraction, and order of operations with integers. Students develop fluency with computational strategies and algebraic reasoning.",
    url: "/units/maths-addition-subtraction-Y6.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-multiplication-division-F",
    title: "Multiplication and Division — Foundation",
    yearLevel: "Foundation",
    subject: "Mathematics",
    description: "8-week maths unit building foundational multiplication and division concepts. Students explore equal groups, sharing equally, and doubling through hands-on materials and real-world contexts.",
    url: "/units/maths-multiplication-division-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-multiplication-division-Y1",
    title: "Multiplication and Division — Year 1",
    yearLevel: "Year 1",
    subject: "Mathematics",
    description: "8-week maths unit on multiplication as groups and division as sharing. Students learn x2, x5, x10 through arrays, equal groups, and inverse operations using concrete materials.",
    url: "/units/maths-multiplication-division-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-multiplication-division-Y2",
    title: "Multiplication and Division — Year 2",
    yearLevel: "Year 2",
    subject: "Mathematics",
    description: "8-week maths unit on multiplication facts and division strategies. Students develop fluency with x2, x3, x4, x5, x10 and learn to use the inverse relationship to check their answers.",
    url: "/units/maths-multiplication-division-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-multiplication-division-Y3",
    title: "Multiplication and Division — Year 3",
    yearLevel: "Year 3",
    subject: "Mathematics",
    description: "8-week maths unit on multiplication and division facts to 10x10. Students apply the distributive property, relate multiplication and division, and solve multi-step word problems.",
    url: "/units/maths-multiplication-division-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-multiplication-division-Y4",
    title: "Multiplication and Division — Year 4",
    yearLevel: "Year 4",
    subject: "Mathematics",
    description: "8-week maths unit on multiplication of 2-digit numbers and division with remainders. Students apply mental strategies, estimate results, and interpret remainders in context.",
    url: "/units/maths-multiplication-division-Y4.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-multiplication-division-Y5",
    title: "Multiplication and Division — Year 5",
    yearLevel: "Year 5",
    subject: "Mathematics",
    description: "8-week maths unit on multiplication and division with decimals and whole numbers. Students apply the formal algorithm, use estimation to check reasonableness, and solve real-world problems.",
    url: "/units/maths-multiplication-division-Y5.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-multiplication-division-Y6",
    title: "Multiplication and Division — Year 6",
    yearLevel: "Year 6",
    subject: "Mathematics",
    description: "8-week maths unit on order of operations, integer multiplication, and division. Students develop fluency with computation and apply multiplicative thinking to algebraic expressions.",
    url: "/units/maths-multiplication-division-Y6.html",
    weeks: 8,
    lessons: 24,
  },
  {
  {
    id: "maths-measurement-Y2",
    title: "Measurement — Year 2",
    yearLevel: "Year 2",
    subject: "Mathematics",
    description: "8-week measurement unit on length, mass, and capacity using formal units. Students estimate, measure, and record using cm, m, g, kg, mL, L, and choose appropriate units for different measurements.",
    url: "/units/maths-measurement-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-geometry-F",
    title: "Geometry — Foundation",
    yearLevel: "Foundation",
    subject: "Mathematics",
    description: "8-week geometry unit exploring 2D shapes and positional language. Students identify circles, squares, triangles, and rectangles, use positional words, and describe shapes by their features.",
    url: "/units/maths-geometry-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-geometry-Y1",
    title: "Geometry — Year 1",
    yearLevel: "Year 1",
    subject: "Mathematics",
    description: "8-week geometry unit on sorting and describing 2D shapes. Students explore symmetry, half-turns, and quarter-turns, and identify shapes in the environment using formal geometric language.",
    url: "/units/maths-geometry-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-geometry-Y2",
    title: "Geometry — Year 2",
    yearLevel: "Year 2",
    subject: "Mathematics",
    description: "8-week geometry unit on 3D objects, angles, and flips and slides. Students describe geometric features, construct 3D objects, and perform simple transformations on a grid.",
    url: "/units/maths-geometry-Y2.html",
    weeks: 8,
    lessons: 24,
  },

    id: "maths-measurement-F",
    title: "Measurement — Foundation",
    yearLevel: "Foundation",
    subject: "Mathematics",
    description: "8-week measurement unit comparing length, mass, and capacity using informal units. Students use hand spans, blocks, and balance scales to explore measurable attributes.",
    url: "/units/maths-measurement-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "maths-measurement-Y1",
    title: "Measurement — Year 1",
    yearLevel: "Year 1",
    subject: "Mathematics",
    description: "8-week measurement unit on length, mass, and capacity using informal and some formal units. Students compare, order, and describe measurements using appropriate language.",
    url: "/units/maths-measurement-Y1.html",
    weeks: 8,
    lessons: 24,
  },

    id: "grammar-punctuation-Y3",
    title: "Grammar and Punctuation — Year 3",
    yearLevel: "Year 3",
    subject: "English",
    description: "8-week grammar and punctuation unit on adverbial phrases, direct speech, past and present tense verbs, and paragraph structure for informative writing.",
    url: "/units/grammar-punctuation-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "grammar-punctuation-Y4",
    title: "Grammar and Punctuation — Year 4",
    yearLevel: "Year 4",
    subject: "English",
    description: "8-week grammar and punctuation unit on complex sentences, embedded clauses, subjunctive mood, and advanced punctuation including dashes and semicolons.",
    url: "/units/grammar-punctuation-Y4.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "grammar-punctuation-Y5",
    title: "Grammar and Punctuation — Year 5",
    yearLevel: "Year 5",
    subject: "English",
    description: "8-week grammar and punctuation unit on modal verbs, relative clauses, passive voice, and sophisticated punctuation for academic and persuasive writing.",
    url: "/units/grammar-punctuation-Y5.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "grammar-punctuation-Y6",
    title: "Grammar and Punctuation — Year 6",
    yearLevel: "Year 6",
    subject: "English",
    description: "8-week grammar and punctuation unit on sophisticated sentence structures, author's craft, метафорический язык, and precision in punctuation for narrative and persuasive texts.",
    url: "/units/grammar-punctuation-Y6.html",
    weeks: 8,
    lessons: 24,
  },
  {
  {
    id: "spelling-phonics-F",
    title: "Spelling and Phonics — Foundation",
    yearLevel: "Foundation",
    subject: "English",
    description: "8-week spelling and phonics unit building phonemic awareness. Students learn letter-sound correspondences, CVC words, and high-frequency words through systematic, multi-sensory instruction.",
    url: "/units/spelling-phonics-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "spelling-phonics-Y1",
    title: "Spelling and Phonics — Year 1",
    yearLevel: "Year 1",
    subject: "English",
    description: "8-week spelling and phonics unit on digraphs, blends, and long vowel patterns. Students develop accurate, automatic word reading and spelling using evidence-based phonics instruction.",
    url: "/units/spelling-phonics-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "spelling-phonics-Y2",
    title: "Spelling and Phonics — Year 2",
    yearLevel: "Year 2",
    subject: "English",
    description: "8-week spelling and phonics unit on spelling rules, common patterns, and morphology. Students learn to spell multisyllabic words and apply spelling strategies independently.",
    url: "/units/spelling-phonics-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "spelling-phonics-Y3",
    title: "Spelling and Phonics — Year 3",
    yearLevel: "Year 3",
    subject: "English",
    description: "8-week spelling and phonics unit on advanced phonics, prefixes, suffixes, and morphological patterns. Students understand how word parts carry meaning and apply this to spelling.",
    url: "/units/spelling-phonics-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "spelling-phonics-Y4",
    title: "Spelling and Phonics — Year 4",
    yearLevel: "Year 4",
    subject: "English",
    description: "8-week spelling and phonics unit on morph etymology, Greek and Latin roots, and advanced word study. Students develop sophisticated vocabulary through word families and word origin study.",
    url: "/units/spelling-phonics-Y4.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "spelling-phonics-Y5",
    title: "Spelling and Phonics — Year 5",
    yearLevel: "Year 5",
    subject: "English",
    description: "8-week spelling and phonics unit on advanced morphology, etymology, and academic vocabulary. Students develop precision in spelling across subjects and understand the history of English spelling.",
    url: "/units/spelling-phonics-Y5.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "spelling-phonics-Y6",
    title: "Spelling and Phonics — Year 6",
    yearLevel: "Year 6",
    subject: "English",
    description: "8-week spelling and phonics unit on sophisticated vocabulary, spelling generalisations, and linguistic precision. Students become confident, accurate spellers who understand how English spelling works.",
    url: "/units/spelling-phonics-Y6.html",
    weeks: 8,
    lessons: 24,
  },

    id: "science-biological-Y2",
    title: "Biological Sciences — Year 2",
    yearLevel: "Year 2",
    subject: "Science",
    description: "8-week biological sciences unit on life cycles of animals and plants. Students observe, compare, and describe the growth and development of living things in their local environment.",
    url: "/units/science-biological-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-biological-Y3",
    title: "Biological Sciences — Year 3",
    yearLevel: "Year 3",
    subject: "Science",
    description: "8-week biological sciences unit on ecosystems and food chains. Students investigate interactions between living things and their environment, including Aboriginal and Torres Strait Islander knowledge systems.",
    url: "/units/science-biological-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
  {
    id: "science-biological-Y4",
    title: "Biological Sciences — Year 4",
    yearLevel: "Year 4",
    subject: "Science",
    description: "8-week biological sciences unit on ecosystems, adaptation, and survival. Students investigate how living things are suited to their habitats and respond to environmental changes.",
    url: "/units/science-biological-Y4.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-biological-Y5",
    title: "Biological Sciences — Year 5",
    yearLevel: "Year 5",
    subject: "Science",
    description: "8-week biological sciences unit on life cycles and reproduction. Students investigate how different organisms reproduce and pass on traits across generations.",
    url: "/units/science-biological-Y5.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-biological-Y6",
    title: "Biological Sciences — Year 6",
    yearLevel: "Year 6",
    subject: "Science",
    description: "8-week biological sciences unit on evolution, adaptation, and survival. Students investigate natural selection, fossil evidence, and how species change over time.",
    url: "/units/science-biological-Y6.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-earth-F",
    title: "Earth Sciences — Foundation",
    yearLevel: "Foundation",
    subject: "Science",
    description: "8-week earth sciences unit exploring the amazing world. Students investigate daily weather, the sky, the sun, and simple Earth features.",
    url: "/units/science-earth-F.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-earth-Y1",
    title: "Earth Sciences — Year 1",
    yearLevel: "Year 1",
    subject: "Science",
    description: "8-week earth sciences unit on the sky and landscape. Students observe daily and seasonal changes and investigate how the sun appears to move.",
    url: "/units/science-earth-Y1.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-earth-Y2",
    title: "Earth Sciences — Year 2",
    yearLevel: "Year 2",
    subject: "Science",
    description: "8-week earth sciences unit on Earth's resources and changes. Students investigate soil, water, rocks, and natural processes that shape the Earth's surface.",
    url: "/units/science-earth-Y2.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "science-earth-Y3",
    title: "Earth Sciences — Year 3",
    yearLevel: "Year 3",
    subject: "Science",
    description: "8-week earth sciences unit on Earth's surface and changes. Students investigate weathering, erosion, and deposition in Australian landscapes.",
    url: "/units/science-earth-Y3.html",
    weeks: 8,
    lessons: 24,
  },

    id: "hass-civics-Y3",
    title: "Civics and Citizenship — Year 3",
    yearLevel: "Year 3",
    subject: "HASS",
    description: "8-week civics unit on rules, laws, and fairness. Students explore why we have rules, how rules protect people, and what happens when rules are broken.",
    url: "/units/hass-civics-Y3.html",
    weeks: 8,
    lessons: 24,
  },
  {
    id: "hass-civics-Y4",
    title: "Civics and Citizenship — Year 4",
    yearLevel: "Year 4",
    subject: "HASS",
    description: "8-week civics unit on democratic principles, local government, and community participation. Students investigate how schools and communities make decisions together.",
    url: "/units/hass-civics-Y4.html",
    weeks: 8,
    lessons: 24,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

interface Unit {
  id: string;
  title: string;
  yearLevel: string | null;
  subject: string | null;
  ac9Codes: string[];
  createdAt: string;
}

function getSubjectColor(subject: string | null) {
  if (!subject) return { bg: C.surface2, text: C.text2, border: C.border };
  return SUBJECT_COLORS[subject] ?? { bg: C.surface2, text: C.text2, border: C.border };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SampleUnitCard({ unit }: { unit: SampleUnit }) {
  const [hovered, setHovered] = useState(false);
  const sc = getSubjectColor(unit.subject);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.surface2 : C.surface,
        border: `1px solid ${hovered ? C.border2 : C.border}`,
        borderRadius: radius.lg,
        padding: "20px",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? shadows.md : shadows.sm,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Subject + Year */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            background: sc.bg,
            color: sc.text,
            border: `1px solid ${sc.border}`,
            padding: "3px 10px",
            borderRadius: radius.full,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {unit.subject}
        </span>
        <span style={{ color: C.text3, fontSize: 11 }}>
          {unit.weeks} weeks · {unit.lessons} lessons
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {unit.title}
      </h3>

      {/* Year level */}
      <p style={{ color: C.text2, fontSize: 12, margin: 0 }}>
        {unit.yearLevel}
      </p>

      {/* Description */}
      <p
        style={{
          color: C.text3,
          fontSize: 12,
          margin: 0,
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {unit.description}
      </p>

      {/* View button */}
      <div style={{ marginTop: 4, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <a
          href={unit.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            background: hovered ? C.primary : C.surface2,
            color: hovered ? "#fff" : C.text2,
            border: "none",
            borderRadius: radius.sm,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          View Unit Plan
        </a>
      </div>
    </div>
  );
}

// ─── Unit Card ───────────────────────────────────────────────────────

function UnitCard({
  unit,
  onOpen,
  onDelete,
}: {
  unit: Unit;
  onOpen: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const sc = getSubjectColor(unit.subject);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.surface2 : C.surface,
        border: `1px solid ${hovered ? C.border2 : C.border}`,
        borderRadius: radius.lg,
        padding: "20px",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? shadows.md : shadows.sm,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "default",
      }}
    >
      {/* Subject tag */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {unit.subject ? (
          <span
            style={{
              background: sc.bg,
              color: sc.text,
              border: `1px solid ${sc.border}`,
              padding: "3px 10px",
              borderRadius: radius.full,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {unit.subject}
          </span>
        ) : (
          <span />
        )}
        <span style={{ color: C.text3, fontSize: 11 }}>
          {formatDate(unit.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          color: C.text,
          fontSize: 15,
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.3,
          flex: 1,
        }}
      >
        {unit.title}
      </h3>

      {/* Year level */}
      {unit.yearLevel && (
        <p style={{ color: C.text2, fontSize: 12, margin: 0 }}>
          {unit.yearLevel}
        </p>
      )}

      {/* AC9 codes */}
      {unit.ac9Codes.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {unit.ac9Codes.slice(0, 3).map((code) => (
            <span
              key={code}
              style={{
                color: C.accent,
                background: `${C.accent}10`,
                border: `1px solid ${C.accent}30`,
                padding: "1px 6px",
                borderRadius: 4,
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              {code}
            </span>
          ))}
          {unit.ac9Codes.length > 3 && (
            <span style={{ color: C.text3, fontSize: 10 }}>
              +{unit.ac9Codes.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 4, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => onOpen(unit)}
          style={{
            flex: 1,
            background: hovered ? C.primary : C.surface2,
            color: hovered ? "#fff" : C.text2,
            border: "none",
            borderRadius: radius.sm,
            padding: "7px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Open
        </button>
        <button
          onClick={() => onDelete(unit)}
          style={{
            background: C.surface2,
            color: C.danger,
            border: `1px solid ${C.border}`,
            borderRadius: radius.sm,
            padding: "7px 10px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${C.danger}15`;
            e.currentTarget.style.borderColor = `${C.danger}50`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = C.surface2;
            e.currentTarget.style.borderColor = C.border;
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────

function DeleteModal({
  unit,
  onConfirm,
  onCancel,
}: {
  unit: Unit;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 40,
          backdropFilter: "blur(3px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: radius.xl,
          padding: "28px 32px",
          zIndex: 50,
          width: "min(420px, calc(100vw - 48px))",
          boxShadow: shadows.lg,
        }}
      >
        <h3 style={{ color: C.text, fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>
          Delete &quot;{unit.title}&quot;?
        </h3>
        <p style={{ color: C.text2, fontSize: 13, margin: "0 0 24px", lineHeight: 1.6 }}>
          This will permanently remove the unit from your library. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: C.surface2,
              color: C.text2,
              border: `1px solid ${C.border}`,
              borderRadius: radius.md,
              padding: "10px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: C.danger,
              color: "#fff",
              border: "none",
              borderRadius: radius.md,
              padding: "10px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Delete Unit
          </button>
        </div>
      </div>
    </>
  );
}

// ─── New Unit Modal ──────────────────────────────────────────────────

function NewUnitModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), yearLevel: yearLevel || null, subject: subject || null, ac9Codes: [], content: {} }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create unit");
      }
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 40,
          backdropFilter: "blur(3px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: radius.xl,
          padding: "28px 32px",
          zIndex: 50,
          width: "min(480px, calc(100vw - 48px))",
          boxShadow: shadows.lg,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ color: C.text, fontSize: 16, fontWeight: 800, margin: 0 }}>
            Create New Unit
          </h3>
          <button
            onClick={onClose}
            style={{
              background: C.surface2,
              color: C.text2,
              border: `1px solid ${C.border}`,
              borderRadius: radius.sm,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Unit Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Fractions"
              required
              style={{
                width: "100%",
                background: C.surface2,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: radius.md,
                padding: "10px 14px",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
              onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                style={{
                  width: "100%",
                  background: C.surface2,
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.md,
                  padding: "10px 14px",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              >
                <option value="">Select...</option>
                {["Pre-Primary","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9","Year 10","Year 11","Year 12"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: "100%",
                  background: C.surface2,
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.md,
                  padding: "10px 14px",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              >
                <option value="">Select...</option>
                {["Mathematics","English","Science","HASS","Technologies","The Arts","HPE","Languages"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ background: `${C.danger}12`, border: `1px solid ${C.danger}40`, color: C.danger, borderRadius: radius.md, padding: "10px 14px", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: C.surface2,
                color: C.text2,
                border: `1px solid ${C.border}`,
                borderRadius: radius.md,
                padding: "10px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              style={{
                flex: 2,
                background: loading ? C.surface2 : C.primary,
                color: loading ? C.text3 : "#fff",
                border: "none",
                borderRadius: radius.md,
                padding: "10px",
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : `0 4px 16px ${C.primary}40`,
              }}
            >
              {loading ? "Creating..." : "Create Unit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Filter Pills ─────────────────────────────────────────────────────

const ALL_SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "HPE", "Languages"];
const ALL_YEARS = ["Pre-Primary","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9","Year 10","Year 11","Year 12"];

function FilterPills({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ color: C.text3, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", minWidth: 60 }}>
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(selected === opt ? "" : opt)}
          style={{
            background: selected === opt ? `${C.primary}20` : C.surface2,
            color: selected === opt ? C.primary : C.text2,
            border: `1px solid ${selected === opt ? C.primary : C.border}`,
            borderRadius: radius.full,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: selected === opt ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main Library Tab ────────────────────────────────────────────────

export default function LibraryTab() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/units");
      if (!res.ok) throw new Error("Failed to load units");
      const data = await res.json();
      setUnits(data.units ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const filtered = units.filter((u) => {
    if (subjectFilter && u.subject !== subjectFilter) return false;
    if (yearFilter && u.yearLevel !== yearFilter) return false;
    return true;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/units/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setUnits((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete unit");
    } finally {
      setDeleting(false);
    }
  }

  function handleOpen(unit: Unit) {
    // Navigate to chat with the unit context
    router.push(`/picklenickai?tab=chat&unit=${unit.id}`);
  }

  const hasFilters = subjectFilter || yearFilter;

  return (
    <div style={{ background: C.bg, minHeight: "100dvh" }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(180deg, #1a1f3d 0%, ${C.surface} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "32px 24px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h1 style={{ color: C.text, fontSize: 24, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                My Unit Library
              </h1>
              <p style={{ color: C.text2, fontSize: 14, margin: 0 }}>
                {loading ? "Loading..." : `${units.length} saved unit${units.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              style={{
                background: C.primary,
                color: "#fff",
                border: "none",
                borderRadius: radius.md,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 4px 16px ${C.primary}40`,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Unit
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FilterPills label="Subject" options={ALL_SUBJECTS} selected={subjectFilter} onChange={setSubjectFilter} />
            <FilterPills label="Year" options={ALL_YEARS} selected={yearFilter} onChange={setYearFilter} />
          </div>

          {hasFilters && (
            <button
              onClick={() => { setSubjectFilter(""); setYearFilter(""); }}
              style={{
                marginTop: 8,
                background: "transparent",
                color: C.danger,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Sample Units */}
      <div style={{ padding: "0 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ paddingTop: 28, marginBottom: 6 }}>
          <h2 style={{ color: C.text, fontSize: 18, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.01em" }}>
            Sample Units
          </h2>
          <p style={{ color: C.text3, fontSize: 13, margin: "0 0 16px" }}>
            Browse complete unit plans built by PickleNickAI. Click any card to open the full lesson plan.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, paddingBottom: 8 }}>
          {SAMPLE_UNITS.map((unit) => (
            <SampleUnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, margin: "24px 0 0" }} />

      {/* My Saved Units */}
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ color: C.text, fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>
              My Saved Units
            </h2>
            <p style={{ color: C.text3, fontSize: 13, margin: 0 }}>
              {loading ? "Loading..." : `${units.length} saved unit${units.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              background: C.primary,
              color: "#fff",
              border: "none",
              borderRadius: radius.md,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 4px 16px ${C.primary}40`,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Unit
          </button>
        </div>

        {/* Filters for saved units */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <FilterPills label="Subject" options={ALL_SUBJECTS} selected={subjectFilter} onChange={setSubjectFilter} />
          <FilterPills label="Year" options={ALL_YEARS} selected={yearFilter} onChange={setYearFilter} />
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSubjectFilter(""); setYearFilter(""); }}
            style={{
              marginBottom: 16,
              background: "transparent",
              color: C.danger,
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            Clear filters
          </button>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.lg,
                  height: 180,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: radius.lg }}>
            <p style={{ color: C.danger, fontSize: 14, margin: "0 0 16px" }}>{error}</p>
            <button onClick={fetchUnits} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: radius.md, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: radius.lg }}>
            <div style={{ width: 56, height: 56, borderRadius: radius.lg, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 10h16M4 14h10M4 18h6" stroke={C.text3} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
              {hasFilters ? "No units match your filters" : "Your saved units will appear here"}
            </h3>
            <p style={{ color: C.text3, fontSize: 13, margin: "0 0 20px" }}>
              {hasFilters ? "Try different filter selections." : "Start a chat and save a lesson plan to build your library."}
            </p>
            {!hasFilters && (
              <button
                onClick={() => router.push("/picklenickai?tab=chat")}
                style={{
                  background: C.primary,
                  color: "#fff",
                  border: "none",
                  borderRadius: radius.md,
                  padding: "10px 24px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: `0 4px 16px ${C.primary}40`,
                }}
              >
                Go to Chat
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map((unit) => (
              <UnitCard key={unit.id} unit={unit} onOpen={handleOpen} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {deleteTarget && (
        <DeleteModal
          unit={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showNewModal && (
        <NewUnitModal
          onClose={() => setShowNewModal(false)}
          onCreated={fetchUnits}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
