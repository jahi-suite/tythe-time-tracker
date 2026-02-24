#!/usr/bin/env node
/**
 * Generates a brochure-style PDF for the marketing landing page content.
 * Run: node tt-ts/scripts/generate-marketing-pdf.mjs
 * Output: tt-ts/marketing-page.pdf
 */

import PDFDocument from 'pdfkit'
import { createWriteStream } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '..', 'marketing-page.pdf')

const doc = new PDFDocument({ margin: 46, size: 'A4' })
const stream = createWriteStream(outPath)
doc.pipe(stream)

const palette = {
  green: '#1e3a2a',
  tan: '#c4a574',
  cream: '#faf8f5',
  charcoal: '#1a1a1a',
  muted: '#5f675f',
  line: '#d8d2ca',
}

const features = [
  ['Clock in & out', 'One tap. Staff clock in from their phone. No paper, no fuss.'],
  [
    'Pay rates, automatic',
    'Add custom pay rates, enhanced rates (like night premium), and venue-specific day/night rates. Set once, calculated forever.',
  ],
  ['Timesheets', 'Personal and manager views. Always up to date, always accurate.'],
  ['Export', 'Excel & PDF. One click. Payroll-ready for your accountant.'],
  ['Manager dashboard', 'See everyone. Add, edit, approve. Quick export all staff.'],
  ['Audit log', 'Who changed what, when. Full traceability for peace of mind.'],
]

const painPoints = [
  'Chasing signatures at month-end',
  'Manual rate calculations — custom day/night, enhanced, supervisor',
  'No audit trail when disputes arise',
]

const howItWorks = [
  ['1. Add your team', 'Create accounts and set custom day/night + enhanced rates. One-time setup.'],
  ['2. Staff clock in', 'From phone or tablet. Times logged automatically.'],
  ['3. Export, done', 'One click. Excel or PDF. Send to payroll.'],
]

function pageSize() {
  return { w: doc.page.width, h: doc.page.height }
}

function resetBackground(color = palette.cream) {
  const { w, h } = pageSize()
  doc.save()
  doc.rect(0, 0, w, h).fill(color)
  doc.restore()
}

function footer(text, { color = palette.muted, yOffset = 30 } = {}) {
  const { w, h } = pageSize()
  doc.font('Helvetica').fontSize(9).fillColor(color).text(text, 46, h - yOffset, {
    width: w - 92,
    align: 'center',
  })
}

function sectionHeader(text, x, y, width) {
  doc.font('Helvetica-Bold').fontSize(17).fillColor(palette.green).text(text, x, y, { width })
  doc.rect(x, y + 22, Math.min(120, width), 3).fill(palette.tan)
}

function bodyText(text, x, y, width, opts = {}) {
  doc.font('Helvetica').fontSize(opts.fontSize || 10.5).fillColor(opts.color || palette.charcoal)
  doc.text(text, x, y, { width, lineGap: opts.lineGap ?? 3, align: opts.align || 'left' })
}

function featureCard({ x, y, w, h, title, desc }) {
  doc.roundedRect(x, y, w, h, 8).lineWidth(1).fillAndStroke('#fffdf9', palette.line)
  doc.rect(x, y, w, 6).fill(palette.tan)
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(palette.charcoal).text(title, x + 12, y + 16, {
    width: w - 24,
  })
  doc.font('Helvetica').fontSize(10).fillColor(palette.charcoal).text(desc, x + 12, y + 34, {
    width: w - 24,
    lineGap: 2,
  })
}

function stepCard({ x, y, w, h, title, desc }) {
  doc.roundedRect(x, y, w, h, 8).lineWidth(1).fillAndStroke(palette.cream, palette.line)
  doc.rect(x, y, w, 5).fill(palette.green)
  doc.font('Helvetica-Bold').fontSize(11).fillColor(palette.green).text(title, x + 10, y + 14, { width: w - 20 })
  doc.font('Helvetica').fontSize(9.5).fillColor(palette.charcoal).text(desc, x + 10, y + 32, {
    width: w - 20,
    lineGap: 2,
  })
}

function drawCoverPage() {
  const { w, h } = pageSize()

  resetBackground(palette.green)

  doc.rect(0, 0, w, 16).fill(palette.tan)
  doc.rect(0, h - 120, w, 120).fill('#173024')
  doc.rect(w - 190, 80, 140, 140).fillAndStroke(palette.tan, palette.tan)
  doc.rect(w - 210, 100, 140, 140).lineWidth(2).stroke('#f0e7d8')

  doc.font('Helvetica-Bold').fontSize(13).fillColor(palette.tan).text('EMPLOYEE PORTAL', 46, 48)
  doc.font('Helvetica').fontSize(10).fillColor('#e8efe9').text(
    'For barns, wedding venues & boutique hospitality',
    46,
    68,
    { width: 300 }
  )

  doc.font('Helvetica-Bold').fontSize(27).fillColor('white').text(
    'Stop chasing timesheets.\nStart running your venue.',
    46,
    160,
    { width: 340, lineGap: 4 }
  )

  doc.font('Helvetica').fontSize(11).fillColor('#e2ebe4').text(
    'Clock in, export, done. Built by a bar manager after too many scraps of paper went missing and too many pay and rate disputes. No spreadsheets, no paper, no month-end chaos.',
    46,
    255,
    { width: 330, lineGap: 4 }
  )

  doc.roundedRect(46, 350, 222, 44, 8).fillAndStroke(palette.tan, palette.tan)
  doc.font('Helvetica-Bold').fontSize(13).fillColor(palette.green).text(
    'Get started. No credit card.',
    62,
    366,
    { width: 190 }
  )

  doc.font('Helvetica-Bold').fontSize(12).fillColor('white').text('Built by a bar manager.', 46, 425)
  doc.font('Helvetica').fontSize(10).fillColor('#d1ddd4').text(
    'Made for busy venue teams that need payroll-ready exports without the admin grind.',
    46,
    443,
    { width: 330, lineGap: 3 }
  )

  doc.font('Helvetica').fontSize(10).fillColor('#f5f8f6').text(
    'Employee Portal — The Tythe Barn',
    46,
    h - 92
  )
  doc.font('Helvetica').fontSize(9).fillColor('#c1d0c5').text(
    'Built for real shifts, real rates, and real month-end deadlines.',
    46,
    h - 74
  )
}

function drawPageTwo() {
  doc.addPage()
  resetBackground()

  const { w } = pageSize()
  const left = 46
  const right = w - 46
  const contentW = right - left

  doc.rect(0, 0, w, 14).fill(palette.green)

  sectionHeader('Still tracking shifts on paper?', left, 38, contentW)
  bodyText(
    "Scattered sheets. Late submissions. Payroll headaches. The last thing you need when you're running events, managing staff, and keeping guests happy.",
    left,
    74,
    250
  )

  let bulletY = 128
  for (const point of painPoints) {
    doc.circle(left + 5, bulletY + 6, 2.2).fill(palette.tan)
    bodyText(point, left + 14, bulletY, 260, { fontSize: 10 })
    bulletY += 26
  }

  doc.roundedRect(322, 58, contentW - 322 + left, 128, 8).fillAndStroke('#fffdf9', palette.line)
  doc.rect(322, 58, contentW - 322 + left, 6).fill(palette.green)
  doc.font('Helvetica-Bold').fontSize(12).fillColor(palette.green).text('Origin story', 336, 74)
  bodyText(
    'Clock in, export, done. Built by a bar manager after too many scraps of paper went missing and too many pay and rate disputes. No spreadsheets, no paper, no month-end chaos.',
    336,
    94,
    right - 350,
    { fontSize: 10 }
  )

  sectionHeader("Everything you need. Nothing you don't.", left, 210, contentW)
  bodyText('Built for small teams. Payroll-ready in one click.', left, 246, contentW, {
    fontSize: 10,
    color: palette.muted,
  })

  const gridTop = 278
  const gap = 12
  const colW = (contentW - gap) / 2
  const rowH = 108

  features.forEach(([title, desc], index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    featureCard({
      x: left + col * (colW + gap),
      y: gridTop + row * (rowH + gap),
      w: colW,
      h: rowH,
      title,
      desc,
    })
  })

  const stepsTop = gridTop + rowH * 3 + gap * 2 + 28
  sectionHeader('How it works', left, stepsTop, contentW)

  const stepY = stepsTop + 36
  const stepGap = 10
  const stepW = (contentW - stepGap * 2) / 3
  const stepH = 86
  howItWorks.forEach(([title, desc], index) => {
    stepCard({
      x: left + index * (stepW + stepGap),
      y: stepY,
      w: stepW,
      h: stepH,
      title,
      desc,
    })
  })

  footer('Employee Portal — The Tythe Barn · Payroll-ready exports in one click')
}

function drawPageThree() {
  doc.addPage()
  resetBackground()

  const { w, h } = pageSize()
  const left = 46
  const contentW = w - 92

  doc.rect(0, 0, w, 14).fill(palette.tan)
  doc.rect(0, 58, w, 90).fill('#f1ebe2')

  sectionHeader('Built by a bar manager', left, 78, contentW)
  bodyText(
    '"I built this because I was sick of scraps of paper going missing and endless disputes with staff over hours and rates. Now we clock in, set our custom day and night rates, and export. No more arguments — it\'s all there."',
    left,
    118,
    470,
    { fontSize: 11, lineGap: 4 }
  )

  doc.font('Helvetica-Bold').fontSize(11).fillColor(palette.charcoal).text('— Constance', left, 206)
  doc.font('Helvetica').fontSize(10).fillColor(palette.muted).text('Tythe Barn Bar Manager', left, 223)

  doc.roundedRect(left, 280, contentW, 190, 10).fillAndStroke('#fffdf9', palette.line)
  doc.rect(left, 280, contentW, 8).fill(palette.green)
  doc.font('Helvetica-Bold').fontSize(16).fillColor(palette.green).text(
    'Ready to stop chasing timesheets?',
    left + 18,
    302,
    { width: 330 }
  )
  bodyText(
    'Add your team, set your rates, and never chase a timesheet again.',
    left + 18,
    334,
    320,
    { fontSize: 11 }
  )

  doc.roundedRect(left + 18, 378, 255, 44, 8).fillAndStroke(palette.tan, palette.tan)
  doc.font('Helvetica-Bold').fontSize(13).fillColor(palette.green).text(
    'Get started. No credit card. Set up in minutes.',
    left + 32,
    394,
    { width: 228 }
  )

  doc.roundedRect(left + 295, 302, contentW - 313, 120, 8).lineWidth(1).fillAndStroke(palette.cream, palette.line)
  doc.font('Helvetica-Bold').fontSize(11).fillColor(palette.green).text('What you get', left + 308, 318)
  ;[
    'Clock in, export, done',
    'Excel & PDF payroll exports',
    'Manager dashboard + audit log',
    'Custom day/night + enhanced rates',
  ].forEach((item, index) => {
    doc.circle(left + 310, 342 + index * 18, 2).fill(palette.tan)
    bodyText(item, left + 320, 336 + index * 18, 190, { fontSize: 9.8 })
  })

  doc.rect(0, h - 130, w, 130).fill(palette.green)
  doc.font('Helvetica-Bold').fontSize(17).fillColor('white').text(
    'Employee Portal — The Tythe Barn',
    left,
    h - 102,
    { width: contentW, align: 'center' }
  )
  doc.font('Helvetica').fontSize(10).fillColor('#dfeae2').text(
    'For barns, wedding venues & boutique hospitality',
    left,
    h - 76,
    { width: contentW, align: 'center' }
  )
  doc.font('Helvetica').fontSize(9).fillColor('#c5d2ca').text(
    'Powered by Kari Suite',
    left,
    h - 56,
    { width: contentW, align: 'center' }
  )
}

drawCoverPage()
drawPageTwo()
drawPageThree()

doc.end()

stream.on('finish', () => {
  console.log('PDF saved to:', outPath)
})
