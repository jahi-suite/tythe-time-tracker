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
  const { w } = pageSize()
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

  doc.moveTo(left + 16, 218).lineTo(left + 150, 218).lineWidth(2).strokeColor(palette.amber).stroke()

  textBlock(copy.hero.subhead, left + 16, 232, 300, { fontSize: 10.7, lineGap: 4, color: palette.smoke })

  doc.moveTo(left + 16, 362).lineTo(left + 316, 362).lineWidth(1).strokeColor('#2d3850').stroke()
  doc.font('Helvetica-Bold').fontSize(16).fillColor(palette.cream).text(copy.hero.byline, left + 16, 376)
  textBlock(copy.hero.role, left + 16, 396, 220, { fontSize: 10, color: palette.haze })

  card({ x: left + 346, y: coverCardsY, w: contentW - 346, h: coverCardsH, fill: '#0e1626', stroke: '#303a4f', radius: 18 })
  sectionBar(copy.hero.managerLabel, left + 358, 84, contentW - 370)
  textBlock(copy.hero.managerBody, left + 358, 116, contentW - 370, { fontSize: 11, lineGap: 4 })
  textBlock(copy.hero.managerBody2, left + 358, 188, contentW - 370, {
    fontSize: 11,
    lineGap: 4,
    color: palette.cream,
  })

  let bulletY = 262
  copy.hero.bullets.forEach((line) => {
    doc.circle(left + 366, bulletY + 5, 2.3).fill(palette.amber)
    textBlock(line, left + 376, bulletY, contentW - 388, { fontSize: 10.2, color: palette.cream })
    bulletY += 28
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
  textBlock(copy.pain.intro, left, 126, 430, { fontSize: 11, lineGap: 4 })

  let y = 172
  copy.pain.moments.forEach((moment, i) => {
    const boxH = 112
    card({ x: left, y, w: contentW, h: boxH, fill: i % 2 === 0 ? '#10192a' : '#0d1423', stroke: '#2d3850', radius: 16 })
    doc.rect(left, y, 6, boxH).fill(i === 2 ? palette.gold : palette.amber)
    doc.roundedRect(left + 18, y + 14, 112, 24, 12).fill('#2a1b06')
    doc.font('Helvetica-Bold').fontSize(9).fillColor(palette.gold).text(moment.time.toUpperCase(), left + 30, y + 22, {
      width: 88,
      align: 'center',
    })
    doc.font('Helvetica-Bold').fontSize(12.5).fillColor(palette.cream).text(moment.title, left + 146, y + 16, {
      width: contentW - 164,
      lineGap: 3,
    })
    textBlock(moment.body, left + 146, y + 52, contentW - 164, { fontSize: 10.5, lineGap: 4 })
    y += boxH + 14
  })

  doc.roundedRect(left, 550, contentW, 88, 18).fillAndStroke('#201504', '#6b4b12')
  doc.font('Helvetica-Bold').fontSize(20).fillColor(palette.cream).text(copy.pain.closer, left + 18, 578, {
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
  textBlock(copy.outcomes.intro, left, 102, contentW, { fontSize: 11, color: palette.smoke })

  const gap = 14
  const colW = (contentW - gap) / 2
  const cardYs = [146, 146 + 196 + gap]

  copy.outcomes.cards.forEach((item, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    const x = left + col * (colW + gap)
    const y = cardYs[row]
    const h = index === 2 ? 238 : 196

    card({ x, y, w: colW, h, fill: '#111a2b', stroke: '#303a50', radius: 16 })
    doc.roundedRect(x + 14, y + 14, 92, 18, 9).fill('#3a2507')
    doc.font('Helvetica-Bold').fontSize(8).fillColor(palette.gold).text('OUTCOME', x + 40, y + 20, {
      width: 40,
      align: 'center',
    })
    doc.font('Helvetica-Bold').fontSize(15).fillColor(palette.cream).text(item.outcome, x + 14, y + 44, {
      width: colW - 28,
      lineGap: 4,
    })

    const innerY = y + h - 84
    doc.roundedRect(x + 14, innerY, colW - 28, 70, 10).fillAndStroke('#0b1220', '#2a3449')
    doc.font('Helvetica-Bold').fontSize(9).fillColor(palette.haze).text('How we do it', x + 24, innerY + 10, {
      width: colW - 48,
      align: 'left',
    })
    textBlock(item.how, x + 24, innerY + 26, colW - 48, { fontSize: 9.8, color: palette.smoke })
  })

  const featureCalloutY = 594
  card({ x: left, y: featureCalloutY, w: contentW, h: 56, fill: '#151f31', stroke: '#334059', radius: 14 })
  doc.rect(left, featureCalloutY, contentW, 6).fill(palette.amber)
  textBlock('Outcome-first features keep admin light: clock-ins, rate maths, edits, audit trail, and exports when you need them.', left + 14, featureCalloutY + 18, contentW - 28, {
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
  copy.mechanics.steps.forEach((step, idx) => {
    const boxH = 116
    card({ x: left, y, w: contentW * 0.62, h: boxH, fill: '#10182a', stroke: '#2d3951', radius: 14 })
    doc.roundedRect(left + 14, y + 14, 32, 32, 10).fill(palette.amber)
    doc.font('Helvetica-Bold').fontSize(14).fillColor(palette.charcoal).text(String(idx + 1), left + 26, y + 24, {
      width: 8,
      align: 'center',
    })
    doc.font('Helvetica-Bold').fontSize(13).fillColor(palette.cream).text(step.title, left + 58, y + 16, {
      width: contentW * 0.62 - 72,
      lineGap: 3,
    })
    textBlock(step.text, left + 58, y + 46, contentW * 0.62 - 72, { fontSize: 10.3, lineGap: 4 })
    y += boxH + 14
  })

  const sideX = left + contentW * 0.62 + 14
  const sideW = contentW - contentW * 0.62 - 14
  card({ x: sideX, y: 118, w: sideW, h: 390, fill: '#1b1407', stroke: '#5a4213', radius: 16 })
  sectionBar(copy.mechanics.mondayTitle, sideX + 12, 132, sideW - 24)

  card({ x: sideX + 12, y: 164, w: sideW - 24, h: 138, fill: '#0f1524', stroke: '#2f3950', radius: 12 })
  doc.font('Helvetica-Bold').fontSize(10).fillColor(palette.haze).text('BEFORE', sideX + 24, 180)
  textBlock(copy.mechanics.before, sideX + 24, 200, sideW - 48, { fontSize: 10.2, lineGap: 4 })

  card({ x: sideX + 12, y: 316, w: sideW - 24, h: 152, fill: '#2a1b06', stroke: '#6b4b12', radius: 12 })
  doc.font('Helvetica-Bold').fontSize(10).fillColor(palette.gold).text('AFTER', sideX + 24, 332)
  textBlock(copy.mechanics.after, sideX + 24, 352, sideW - 48, { fontSize: 10.5, lineGap: 4, color: palette.cream })
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

  doc.moveTo(left + 120, 208).lineTo(left + contentW - 120, 208).lineWidth(1.5).strokeColor('#41506f').stroke()
  textBlock(copy.testimonial.body, left + 54, 228, contentW - 108, {
    fontSize: 11.2,
    color: palette.smoke,
    align: 'center',
    lineGap: 4,
  })
  textBlock(copy.testimonial.payoff, left + 54, 300, contentW - 108, {
    fontSize: 11.2,
    color: palette.cream,
    align: 'center',
    lineGap: 4,
    font: 'Helvetica-Bold',
  })
  doc.font('Helvetica-Bold').fontSize(14).fillColor(palette.gold).text(copy.testimonial.name, left + 24, 374, {
    width: contentW - 48,
    align: 'center',
  })
  textBlock(copy.testimonial.role, left + 24, 392, contentW - 48, {
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
  textBlock(copy.cta.body, left + 18, 552, contentW - 36, { fontSize: 11, color: '#efe7db', lineGap: 4 })

  doc.roundedRect(left + 18, 616, 262, 34, 11).fill(palette.amber)
  doc.font('Helvetica-Bold').fontSize(11).fillColor(palette.charcoal).text(copy.cta.button, left + 34, 628, {
    width: 228,
    align: 'center',
  })
  textBlock(copy.cta.note, left + 294, 620, contentW - 312, { fontSize: 10.2, color: palette.smoke })
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
