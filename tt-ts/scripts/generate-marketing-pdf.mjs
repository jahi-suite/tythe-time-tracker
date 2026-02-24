#!/usr/bin/env node
/**
 * Generates a brochure-style PDF synced to the v2 marketing page copy.
 * Run: node tt-ts/scripts/generate-marketing-pdf.mjs
 * Outputs:
 *   - tt-ts/marketing-page.pdf
 *   - tt-ts/public/marketing-page.pdf
 */

import PDFDocument from 'pdfkit'
import { copyFileSync, createWriteStream, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const outPath = join(rootDir, 'marketing-page.pdf')
const publicOutPath = join(rootDir, 'public', 'marketing-page.pdf')

const palette = {
  ink: '#070a10',
  navy: '#0f172a',
  panel: '#121a2b',
  panel2: '#172033',
  line: '#2a3347',
  amber: '#f59e0b',
  gold: '#fbbf24',
  cream: '#f8f3e7',
  smoke: '#d6d0c7',
  haze: '#a3acbf',
  charcoal: '#111827',
  warmPaper: '#f4ede0',
  warmCard: '#fff8eb',
  wine: '#3a1022',
}

const copy = {
  hero: {
    eyebrow: 'The first thing you should know',
    headline: '“I built this after one too many nights hunting for a missing timesheet.”',
    subhead:
      'I was managing the bar, closing out events, and then trying to rebuild hours from scraps of paper. People were tired. I was tired. Hours got argued about. Rates got argued about. I was fed up, so I built the thing I wanted at 11pm on a Saturday: clock in, clock out, clear records, payroll done.',
    byline: 'Constance',
    role: 'Bar Manager, The Tythe Barn',
    chip: 'Constance built this',
    managerLabel: 'For the manager doing three jobs at once',
    managerBody:
      'You are not “operations” in a neat little org chart. You are on the floor, fixing rota gaps, answering staff questions, and then somehow expected to do payroll without missing a beat.',
    managerBody2:
      'This page is for the person who says, “I’ll deal with it Monday,” and then spends Monday untangling chaos.',
    bullets: [
      'No more scraps of paper',
      'No more “whose shift was that?”',
      'No more rebuilding weekends from memory',
      'No more payroll guesswork',
    ],
  },
  pain: {
    bar: 'The bit that feels too accurate',
    title: 'A normal Saturday night, if you’re still doing hours the old way',
    intro:
      'This is not a fake problem statement. This is the exact kind of weekend that turns into a payroll nightmare.',
    moments: [
      {
        time: '11:07pm',
        title: 'Wedding still going. Staff already asking what time they can leave.',
        body: "You say you'll sort hours later because the bar queue is six deep and someone's till is short.",
      },
      {
        time: '12:18am',
        title: 'Someone writes their finish time on a napkin.',
        body: "Another person says, 'I clocked out, didn't I?' Nobody remembers whose clipboard had the sheet.",
      },
      {
        time: 'Monday 8:12am',
        title: 'Payroll starts with: whose shift was that?',
        body: 'Now you are rebuilding a weekend from messages, photos, and memory while trying to open the venue.',
      },
    ],
    closer: 'Payroll should not start with “whose shift was that?”',
  },
  outcomes: {
    bar: 'What you actually buy',
    title: 'Outcomes first. Features second.',
    intro: 'You do not need another dashboard. You need fewer Sunday-night headaches.',
    cards: [
      {
        outcome: 'You close your laptop Friday knowing payroll is basically done.',
        how: 'Hours are already there, rates are already applied, and export is ready when you need it.',
      },
      {
        outcome: 'Arguments about hours stop being a 40-minute conversation.',
        how: 'Every edit is visible. You can see who changed what and when, instead of playing detective.',
      },
      {
        outcome: 'You stop carrying the whole system around in your head.',
        how: 'Staff log their own time. You approve, fix exceptions, and move on with your night.',
      },
    ],
  },
  mechanics: {
    bar: 'How it works in practice',
    steps: [
      {
        title: 'Clock-ins that survive busy nights',
        text: 'Phone or tablet. Quick in, quick out. No paper sheet drifting around the venue.',
      },
      {
        title: 'Rates set once',
        text: 'Day, night, enhanced, supervisor. Set your messy real-world rates and let the app do the maths.',
      },
      {
        title: 'Fix the weird stuff fast',
        text: "Missed clock-out? Wrong role? Edit it in seconds without breaking the whole week's record.",
      },
    ],
    mondayTitle: 'Monday morning looks different',
    before:
      'Message staff. Check paper sheets. Recalculate rates. Hope nobody disputes it.',
    after:
      'Open portal. Review exceptions. Export. Send payroll. Go do your actual job.',
  },
  testimonial: {
    bar: 'Built by someone who was done with timesheet chaos',
    quote: '“I built this after one too many nights hunting for a missing timesheet.”',
    body:
      'I was managing the bar, closing out events, and then trying to rebuild hours from scraps of paper. People were tired. I was tired. Hours got argued about. Rates got argued about.',
    payoff:
      'I was fed up, so I built the thing I wanted at 11pm on a Saturday: clock in, clock out, clear records, payroll done.',
    name: 'Constance',
    role: 'Bar Manager, The Tythe Barn',
  },
  cta: {
    bar: 'Last orders CTA',
    title: 'Give yourself one less Sunday-night dread spiral.',
    body:
      'Start using the portal before your next busy weekend, so Monday payroll is a quick admin job instead of a reconstruction project.',
    button: 'Set it up before this weekend',
    note: 'No sales call. Just log in and start with your team.',
  },
}

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 42, right: 42, bottom: 0, left: 42 },
})
const stream = createWriteStream(outPath)
doc.pipe(stream)

function pageSize() {
  return { w: doc.page.width, h: doc.page.height }
}

function fullBleed(color) {
  const { w, h } = pageSize()
  doc.save()
  doc.rect(0, 0, w, h).fill(color)
  doc.restore()
}

function darkPageBackdrop() {
  const { w, h } = pageSize()
  fullBleed(palette.ink)
  doc.save()
  doc.rect(0, 0, w, h * 0.55).fill(palette.navy)
  doc.fillOpacity(0.14).circle(90, 120, 110).fill(palette.gold)
  doc.fillOpacity(0.08).circle(w - 60, 160, 130).fill('#f97316')
  doc.fillOpacity(0.12).circle(w - 40, h - 110, 90).fill('#7c2d12')
  doc.fillOpacity(1)
  doc.restore()
}

function pageChrome(pageTitle, pageNo) {
  const { w, h } = pageSize()
  doc.save()
  doc.rect(0, 0, w, 10).fill(palette.amber)
  doc.rect(0, h - 28, w, 28).fill('#0b1220')
  doc.font('Helvetica').fontSize(9).fillColor(palette.haze)
  doc.text('Employee Portal - The Tythe Barn', 42, h - 18, { width: 240, lineBreak: false })
  doc.text(pageTitle, 42 + 240, h - 18, { width: 180, align: 'center', lineBreak: false })
  doc.text(String(pageNo), w - 70, h - 18, { width: 28, align: 'right', lineBreak: false })
  doc.restore()
}

function sectionBar(text, x, y, width) {
  doc.save()
  doc.roundedRect(x, y, width, 20, 8).fill('#2a1b06')
  doc.roundedRect(x + 1, y + 1, width - 2, 18, 7).strokeColor('#5d430e').stroke()
  doc.font('Helvetica-Bold').fontSize(9).fillColor(palette.gold)
  doc.text(text.toUpperCase(), x + 10, y + 6, {
    width: width - 20,
    align: 'left',
  })
  doc.restore()
}

function textBlock(text, x, y, width, opts = {}) {
  doc.font(opts.font || 'Helvetica')
    .fontSize(opts.fontSize ?? 11)
    .fillColor(opts.color || palette.smoke)
    .text(text, x, y, {
      width,
      lineGap: opts.lineGap ?? 3,
      align: opts.align || 'left',
    })
}

function measure(text, width, opts = {}) {
  doc.font(opts.font || 'Helvetica').fontSize(opts.fontSize ?? 11)
  return doc.heightOfString(text, {
    width,
    lineGap: opts.lineGap ?? 3,
    align: opts.align || 'left',
  })
}

function card({ x, y, w, h, fill = palette.panel, stroke = palette.line, radius = 12 }) {
  doc.save()
  doc.roundedRect(x, y, w, h, radius).lineWidth(1).fillAndStroke(fill, stroke)
  doc.restore()
}

function drawCoverPage() {
  darkPageBackdrop()
  const { w, h } = pageSize()
  const left = 42
  const contentW = w - 84
  const coverCardsY = 68
  const coverCardsH = 370
  const contentBottom = coverCardsY + coverCardsH
  const ctaY = contentBottom + 28

  pageChrome('Constance story', 1)
  sectionBar(copy.hero.eyebrow, left, 34, 220)

  card({ x: left, y: coverCardsY, w: 332, h: coverCardsH, fill: '#11192a', stroke: '#364159', radius: 18 })
  doc.roundedRect(left + 214, 80, 108, 20, 10).fill('#3a2507')
  doc.font('Helvetica-Bold').fontSize(8).fillColor(palette.gold).text(copy.hero.chip.toUpperCase(), left + 224, 87)

  doc.font('Helvetica-Bold').fontSize(22).fillColor(palette.cream).text(copy.hero.headline, left + 16, 112, {
    width: 300,
    lineGap: 4,
  })

  let leftPanelY = 112 + measure(copy.hero.headline, 300, { font: 'Helvetica-Bold', fontSize: 22, lineGap: 4 }) + 14
  doc.moveTo(left + 16, leftPanelY).lineTo(left + 150, leftPanelY).lineWidth(2).strokeColor(palette.amber).stroke()

  leftPanelY += 14
  textBlock(copy.hero.subhead, left + 16, leftPanelY, 300, { fontSize: 10.7, lineGap: 4, color: palette.smoke })
  leftPanelY += measure(copy.hero.subhead, 300, { fontSize: 10.7, lineGap: 4 }) + 14

  doc.moveTo(left + 16, leftPanelY).lineTo(left + 316, leftPanelY).lineWidth(1).strokeColor('#2d3850').stroke()
  leftPanelY += 14
  doc.font('Helvetica-Bold').fontSize(16).fillColor(palette.cream).text(copy.hero.byline, left + 16, leftPanelY)
  leftPanelY += measure(copy.hero.byline, 220, { font: 'Helvetica-Bold', fontSize: 16 }) + 4
  textBlock(copy.hero.role, left + 16, leftPanelY, 220, { fontSize: 10, color: palette.haze })

  card({ x: left + 346, y: coverCardsY, w: contentW - 346, h: coverCardsH, fill: '#0e1626', stroke: '#303a4f', radius: 18 })
  sectionBar(copy.hero.managerLabel, left + 358, 84, contentW - 370)
  let rightPanelY = 116
  const panelW = contentW - 370
  const panelOpts = { fontSize: 11, lineGap: 4 }
  const h1 = measure(copy.hero.managerBody, panelW, panelOpts)
  textBlock(copy.hero.managerBody, left + 358, rightPanelY, panelW, panelOpts)
  rightPanelY += h1 + 12

  const managerBody2Opts = { ...panelOpts, color: palette.cream }
  const h2 = measure(copy.hero.managerBody2, panelW, managerBody2Opts)
  textBlock(copy.hero.managerBody2, left + 358, rightPanelY, panelW, managerBody2Opts)
  rightPanelY += h2 + 16

  copy.hero.bullets.forEach((line) => {
    doc.circle(left + 366, rightPanelY + 5, 2.3).fill(palette.amber)
    const lineH = measure(line, panelW - 10, { fontSize: 10.2 })
    textBlock(line, left + 376, rightPanelY, panelW - 10, { fontSize: 10.2, color: palette.cream })
    rightPanelY += lineH + 2
  })

  doc.roundedRect(left, ctaY, contentW, 54, 14).fillAndStroke('#1a2235', '#33415b')
  doc.roundedRect(left + 14, ctaY + 14, 230, 28, 10).fill(palette.amber)
  doc.font('Helvetica-Bold').fontSize(11).fillColor(palette.charcoal).text(copy.cta.button, left + 24, ctaY + 24, {
    width: 210,
    align: 'center',
  })
  textBlock('Built for real shifts, not demos.', left + 258, ctaY + 22, contentW - 272, {
    fontSize: 10.5,
    color: palette.smoke,
  })
}

function drawPainPage() {
  doc.addPage()
  darkPageBackdrop()
  pageChrome('Saturday-night pain', 2)

  const { w } = pageSize()
  const left = 42
  const contentW = w - 84

  sectionBar(copy.pain.bar, left, 34, 230)
  doc.font('Helvetica-Bold').fontSize(23).fillColor(palette.cream).text(copy.pain.title, left, 66, {
    width: contentW,
    lineGap: 5,
  })
  let painY = 66 + measure(copy.pain.title, contentW, { font: 'Helvetica-Bold', fontSize: 23, lineGap: 5 }) + 10
  textBlock(copy.pain.intro, left, painY, 430, { fontSize: 11, lineGap: 4 })
  painY += measure(copy.pain.intro, 430, { fontSize: 11, lineGap: 4 }) + 18

  let y = painY
  copy.pain.moments.forEach((moment, i) => {
    const titleW = contentW - 164
    const titleH = measure(moment.title, titleW, { font: 'Helvetica-Bold', fontSize: 12.5, lineGap: 3 })
    const bodyY = y + 20 + titleH + 10
    const bodyH = measure(moment.body, titleW, { fontSize: 10.5, lineGap: 4 })
    const contentBottomY = bodyY + bodyH
    const boxH = Math.max(112, contentBottomY - y + 18)
    card({ x: left, y, w: contentW, h: boxH, fill: i % 2 === 0 ? '#10192a' : '#0d1423', stroke: '#2d3850', radius: 16 })
    doc.rect(left, y, 6, boxH).fill(i === 2 ? palette.gold : palette.amber)
    doc.roundedRect(left + 18, y + 14, 112, 24, 12).fill('#2a1b06')
    doc.font('Helvetica-Bold').fontSize(9).fillColor(palette.gold).text(moment.time.toUpperCase(), left + 30, y + 22, {
      width: 88,
      align: 'center',
    })
    doc.font('Helvetica-Bold').fontSize(12.5).fillColor(palette.cream).text(moment.title, left + 146, y + 16, {
      width: titleW,
      lineGap: 3,
    })
    textBlock(moment.body, left + 146, bodyY, titleW, { fontSize: 10.5, lineGap: 4 })
    y += boxH + 14
  })

  const closerY = y + 10
  const closerTextH = measure(copy.pain.closer, contentW - 36, { font: 'Helvetica-Bold', fontSize: 20, lineGap: 4, align: 'center' })
  const closerH = Math.max(88, closerTextH + 40)
  doc.roundedRect(left, closerY, contentW, closerH, 18).fillAndStroke('#201504', '#6b4b12')
  doc.font('Helvetica-Bold').fontSize(20).fillColor(palette.cream).text(copy.pain.closer, left + 18, closerY + (closerH - closerTextH) / 2, {
    width: contentW - 36,
    align: 'center',
    lineGap: 4,
  })
}

function drawOutcomesPage() {
  doc.addPage()
  darkPageBackdrop()
  pageChrome('Outcomes first', 3)

  const { w } = pageSize()
  const left = 42
  const contentW = w - 84

  sectionBar(copy.outcomes.bar, left, 34, 190)
  doc.font('Helvetica-Bold').fontSize(24).fillColor(palette.cream).text(copy.outcomes.title, left, 66, {
    width: contentW,
  })
  let outcomesY = 66 + measure(copy.outcomes.title, contentW, { font: 'Helvetica-Bold', fontSize: 24 }) + 10
  textBlock(copy.outcomes.intro, left, outcomesY, contentW, { fontSize: 11, color: palette.smoke })
  outcomesY += measure(copy.outcomes.intro, contentW, { fontSize: 11 }) + 14

  const gap = 14
  const colW = (contentW - gap) / 2
  const colBottoms = [outcomesY, outcomesY]

  copy.outcomes.cards.forEach((item, index) => {
    const col = index % 2
    const x = left + col * (colW + gap)
    const y = colBottoms[col]
    const labelY = y + 14
    const outcomeY = y + 44
    const outcomeW = colW - 28
    const outcomeH = measure(item.outcome, outcomeW, { font: 'Helvetica-Bold', fontSize: 15, lineGap: 4 })
    const innerY = outcomeY + outcomeH + 14
    const howW = colW - 48
    const howY = innerY + 26
    const howH = measure(item.how, howW, { fontSize: 9.8 })
    const innerH = Math.max(70, howH + 34)
    const h = innerY + innerH + 14 - y

    card({ x, y, w: colW, h, fill: '#111a2b', stroke: '#303a50', radius: 16 })
    doc.roundedRect(x + 14, labelY, 92, 18, 9).fill('#3a2507')
    doc.font('Helvetica-Bold').fontSize(8).fillColor(palette.gold).text('OUTCOME', x + 40, y + 20, {
      width: 40,
      align: 'center',
    })
    doc.font('Helvetica-Bold').fontSize(15).fillColor(palette.cream).text(item.outcome, x + 14, outcomeY, {
      width: outcomeW,
      lineGap: 4,
    })

    doc.roundedRect(x + 14, innerY, colW - 28, innerH, 10).fillAndStroke('#0b1220', '#2a3449')
    doc.font('Helvetica-Bold').fontSize(9).fillColor(palette.haze).text('How we do it', x + 24, innerY + 10, {
      width: howW,
      align: 'left',
    })
    textBlock(item.how, x + 24, howY, howW, { fontSize: 9.8, color: palette.smoke })
    colBottoms[col] += h + gap
  })

  const featureCalloutY = Math.max(colBottoms[0], colBottoms[1]) + 6
  const featureCalloutText =
    'Outcome-first features keep admin light: clock-ins, rate maths, edits, audit trail, and exports when you need them.'
  const featureCalloutTextH = measure(featureCalloutText, contentW - 28, {
    fontSize: 10,
    align: 'center',
  })
  const featureCalloutH = Math.max(56, featureCalloutTextH + 28)
  card({ x: left, y: featureCalloutY, w: contentW, h: featureCalloutH, fill: '#151f31', stroke: '#334059', radius: 14 })
  doc.rect(left, featureCalloutY, contentW, 6).fill(palette.amber)
  textBlock(featureCalloutText, left + 14, featureCalloutY + 18, contentW - 28, {
    fontSize: 10,
    color: palette.cream,
    align: 'center',
  })
}

function drawMechanicsPage() {
  doc.addPage()
  darkPageBackdrop()
  pageChrome('How it works', 4)

  const { w } = pageSize()
  const left = 42
  const contentW = w - 84

  sectionBar(copy.mechanics.bar, left, 34, 220)
  doc.font('Helvetica-Bold').fontSize(22).fillColor(palette.cream).text('What changes in the week after go-live', left, 66, {
    width: contentW,
  })

  let y = 118
  const stepsW = contentW * 0.62
  copy.mechanics.steps.forEach((step, idx) => {
    const titleW = stepsW - 72
    const titleH = measure(step.title, titleW, { font: 'Helvetica-Bold', fontSize: 13, lineGap: 3 })
    const bodyY = y + 20 + titleH + 10
    const bodyH = measure(step.text, titleW, { fontSize: 10.3, lineGap: 4 })
    const boxH = Math.max(116, bodyY + bodyH + 18 - y)
    card({ x: left, y, w: stepsW, h: boxH, fill: '#10182a', stroke: '#2d3951', radius: 14 })
    doc.roundedRect(left + 14, y + 14, 32, 32, 10).fill(palette.amber)
    doc.font('Helvetica-Bold').fontSize(14).fillColor(palette.charcoal).text(String(idx + 1), left + 26, y + 24, {
      width: 8,
      align: 'center',
    })
    doc.font('Helvetica-Bold').fontSize(13).fillColor(palette.cream).text(step.title, left + 58, y + 16, {
      width: titleW,
      lineGap: 3,
    })
    textBlock(step.text, left + 58, bodyY, titleW, { fontSize: 10.3, lineGap: 4 })
    y += boxH + 14
  })

  const sideX = left + stepsW + 14
  const sideW = contentW - stepsW - 14
  const sideTop = 118
  let sideCursorY = 164
  const sideInnerW = sideW - 24
  const beforeTextH = measure(copy.mechanics.before, sideW - 48, { fontSize: 10.2, lineGap: 4 })
  const beforeCardH = Math.max(138, beforeTextH + 52)
  const afterTextH = measure(copy.mechanics.after, sideW - 48, { fontSize: 10.5, lineGap: 4 })
  const afterCardY = sideCursorY + beforeCardH + 14
  const afterCardH = Math.max(152, afterTextH + 54)
  const sidePanelH = afterCardY + afterCardH + 14 - sideTop
  card({ x: sideX, y: sideTop, w: sideW, h: sidePanelH, fill: '#1b1407', stroke: '#5a4213', radius: 16 })
  sectionBar(copy.mechanics.mondayTitle, sideX + 12, 132, sideW - 24)

  card({ x: sideX + 12, y: sideCursorY, w: sideInnerW, h: beforeCardH, fill: '#0f1524', stroke: '#2f3950', radius: 12 })
  doc.font('Helvetica-Bold').fontSize(10).fillColor(palette.haze).text('BEFORE', sideX + 24, 180)
  textBlock(copy.mechanics.before, sideX + 24, 200, sideW - 48, { fontSize: 10.2, lineGap: 4 })

  card({ x: sideX + 12, y: afterCardY, w: sideInnerW, h: afterCardH, fill: '#2a1b06', stroke: '#6b4b12', radius: 12 })
  doc.font('Helvetica-Bold').fontSize(10).fillColor(palette.gold).text('AFTER', sideX + 24, afterCardY + 16)
  textBlock(copy.mechanics.after, sideX + 24, afterCardY + 36, sideW - 48, { fontSize: 10.5, lineGap: 4, color: palette.cream })
}

function drawTestimonialAndCtaPage() {
  doc.addPage()
  darkPageBackdrop()
  pageChrome('Testimonial + CTA', 5)

  const { w, h } = pageSize()
  const left = 42
  const contentW = w - 84

  card({ x: left, y: 38, w: contentW, h: 388, fill: '#10192a', stroke: '#36425c', radius: 20 })
  doc.rect(left, 38, 12, 388).fill(palette.amber)
  doc.rect(left + contentW - 12, 38, 12, 388).fill(palette.amber)
  sectionBar(copy.testimonial.bar, left + 20, 56, 290)

  doc.font('Helvetica-Bold').fontSize(27).fillColor(palette.cream).text(copy.testimonial.quote, left + 24, 102, {
    width: contentW - 48,
    lineGap: 6,
    align: 'center',
  })

  let testimonialY =
    102 +
    measure(copy.testimonial.quote, contentW - 48, {
      font: 'Helvetica-Bold',
      fontSize: 27,
      lineGap: 6,
      align: 'center',
    }) +
    14
  doc.moveTo(left + 120, testimonialY).lineTo(left + contentW - 120, testimonialY).lineWidth(1.5).strokeColor('#41506f').stroke()
  testimonialY += 20
  textBlock(copy.testimonial.body, left + 54, testimonialY, contentW - 108, {
    fontSize: 11.2,
    color: palette.smoke,
    align: 'center',
    lineGap: 4,
  })
  testimonialY += measure(copy.testimonial.body, contentW - 108, { fontSize: 11.2, align: 'center', lineGap: 4 }) + 10
  textBlock(copy.testimonial.payoff, left + 54, testimonialY, contentW - 108, {
    fontSize: 11.2,
    color: palette.cream,
    align: 'center',
    lineGap: 4,
    font: 'Helvetica-Bold',
  })
  testimonialY +=
    measure(copy.testimonial.payoff, contentW - 108, {
      font: 'Helvetica-Bold',
      fontSize: 11.2,
      align: 'center',
      lineGap: 4,
    }) + 14
  doc.font('Helvetica-Bold').fontSize(14).fillColor(palette.gold).text(copy.testimonial.name, left + 24, testimonialY, {
    width: contentW - 48,
    align: 'center',
  })
  testimonialY += measure(copy.testimonial.name, contentW - 48, { font: 'Helvetica-Bold', fontSize: 14, align: 'center' }) + 4
  textBlock(copy.testimonial.role, left + 24, testimonialY, contentW - 48, {
    fontSize: 10,
    color: palette.haze,
    align: 'center',
  })

  card({ x: left, y: 446, w: contentW, h: h - 446 - 44, fill: '#1d1405', stroke: '#6a4c13', radius: 18 })
  doc.rect(left, 446, contentW, 8).fill(palette.gold)
  sectionBar(copy.cta.bar, left + 18, 466, 150)
  doc.font('Helvetica-Bold').fontSize(22).fillColor(palette.cream).text(copy.cta.title, left + 18, 496, {
    width: contentW - 36,
    lineGap: 4,
  })
  let ctaY =
    496 + measure(copy.cta.title, contentW - 36, { font: 'Helvetica-Bold', fontSize: 22, lineGap: 4 }) + 12
  textBlock(copy.cta.body, left + 18, ctaY, contentW - 36, { fontSize: 11, color: '#efe7db', lineGap: 4 })
  ctaY += measure(copy.cta.body, contentW - 36, { fontSize: 11, lineGap: 4 }) + 16

  doc.roundedRect(left + 18, ctaY, 262, 34, 11).fill(palette.amber)
  doc.font('Helvetica-Bold').fontSize(11).fillColor(palette.charcoal).text(copy.cta.button, left + 34, ctaY + 12, {
    width: 228,
    align: 'center',
  })
  textBlock(copy.cta.note, left + 294, ctaY + 4, contentW - 312, { fontSize: 10.2, color: palette.smoke })
}

drawCoverPage()
drawPainPage()
drawOutcomesPage()
drawMechanicsPage()
drawTestimonialAndCtaPage()

doc.end()

stream.on('finish', () => {
  mkdirSync(join(rootDir, 'public'), { recursive: true })
  copyFileSync(outPath, publicOutPath)
  console.log('PDF saved to:', outPath)
  console.log('PDF copied to:', publicOutPath)
})

stream.on('error', (err) => {
  console.error('Failed to write marketing PDF:', err)
  process.exitCode = 1
})
