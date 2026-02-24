import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Shield,
  Users,
} from 'lucide-react'

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' as const },
}

function Scribble({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 46"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M4 24C31 11 41 38 68 24C95 10 102 37 129 22C154 8 171 34 196 20C203 16 210 15 216 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M3 32C30 19 42 46 69 31C96 17 103 44 130 29C155 15 172 41 197 27C204 23 211 22 217 25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

function ClockBadge({ reducedMotion }: { reducedMotion: boolean }) {
  const handTransition = reducedMotion
    ? undefined
    : { repeat: Infinity, duration: 24, ease: 'linear' as const }

  const minuteTransition = reducedMotion
    ? undefined
    : { repeat: Infinity, duration: 6, ease: 'linear' as const }

  return (
    <div className="relative h-28 w-28 rounded-full border border-lastcall-line bg-lastcall-ink/80 shadow-[0_0_0_6px_rgba(241,177,91,0.08)]">
      <div className="absolute inset-3 rounded-full border border-lastcall-amber/20" />
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 h-2 w-px origin-bottom bg-lastcall-smoke/50"
          style={{ transform: `translate(-50%, -100%) rotate(${i * 30}deg) translateY(-42px)` }}
        />
      ))}
      <motion.span
        className="absolute left-1/2 top-1/2 h-7 w-0.5 origin-bottom rounded-full bg-lastcall-cream"
        style={{ transformOrigin: 'bottom center' }}
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={handTransition}
        initial={reducedMotion ? false : { rotate: 18 }}
      />
      <motion.span
        className="absolute left-1/2 top-1/2 h-10 w-px origin-bottom rounded-full bg-lastcall-amber"
        style={{ transformOrigin: 'bottom center' }}
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={minuteTransition}
        initial={reducedMotion ? false : { rotate: 96 }}
      />
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lastcall-amber/40 bg-lastcall-ink" />
    </div>
  )
}

export function MarketingLandingPage() {
  const reducedMotion = useReducedMotion()

  const nightmareMoments = [
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
  ]

  const outcomes = [
    {
      icon: FileSpreadsheet,
      outcome: 'You close your laptop Friday knowing payroll is basically done.',
      how: 'Hours are already there, rates are already applied, and export is ready when you need it.',
    },
    {
      icon: Shield,
      outcome: "Arguments about hours stop being a 40-minute conversation.",
      how: 'Every edit is visible. You can see who changed what and when, instead of playing detective.',
    },
    {
      icon: Users,
      outcome: 'You stop carrying the whole system around in your head.',
      how: 'Staff log their own time. You approve, fix exceptions, and move on with your night.',
    },
  ]

  const mechanics = [
    {
      icon: Clock,
      title: 'Clock-ins that survive busy nights',
      text: 'Phone or tablet. Quick in, quick out. No paper sheet drifting around the venue.',
    },
    {
      icon: FileText,
      title: 'Rates set once',
      text: 'Day, night, enhanced, supervisor. Set your messy real-world rates and let the app do the maths.',
    },
    {
      icon: AlertTriangle,
      title: 'Fix the weird stuff fast',
      text: "Missed clock-out? Wrong role? Edit it in seconds without breaking the whole week's record.",
    },
  ]

  return (
    <div className="min-h-screen bg-lastcall-ink font-sans text-lastcall-cream antialiased">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(241,177,91,0.14),transparent_42%),radial-gradient(circle_at_90%_20%,rgba(96,106,130,0.14),transparent_45%),linear-gradient(180deg,#070a10_0%,#0b1020_52%,#070a10_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lastcall-amber/40 to-transparent" />
        <div className="absolute left-[-10%] top-32 h-56 w-56 rounded-full bg-lastcall-wine/50 blur-3xl" />
        <div className="absolute right-[-8%] top-16 h-72 w-72 rounded-full bg-lastcall-amber/10 blur-3xl" />

        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lastcall-line bg-lastcall-panel/80 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <Clock className="h-5 w-5 text-lastcall-amber" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-none text-lastcall-cream">
                Employee Portal
              </p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-lastcall-smoke">
                built for venue nights
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="rounded-full border border-lastcall-line bg-lastcall-panel/70 px-4 py-2 text-sm font-semibold text-lastcall-cream transition hover:border-lastcall-amber/50 hover:text-lastcall-amber"
          >
            Log in
          </Link>
        </nav>

        <header className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-4 sm:px-6 sm:pb-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start"
          >
            <div className="relative">
              <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-lastcall-smoke">
                <ClockBadge reducedMotion={!!reducedMotion} />
              </div>
              <div className="relative rounded-3xl border border-lastcall-line bg-lastcall-panel/85 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-7">
                <div className="absolute -right-2 top-4 rotate-6 rounded-full border border-lastcall-amber/35 bg-lastcall-amber/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-lastcall-amber">
                  Constance built this
                </div>
                <p className="text-xs uppercase tracking-[0.22em] text-lastcall-smoke">
                  The first thing you should know
                </p>
                <h1 className="mt-3 font-display text-3xl leading-tight text-lastcall-cream sm:text-5xl">
                  &ldquo;I built this after one too many nights hunting for a missing timesheet.&rdquo;
                </h1>
                <div className="relative mt-5">
                  <Scribble className="pointer-events-none absolute -bottom-2 left-0 h-6 w-44 text-lastcall-amber/60" />
                  <p className="relative max-w-2xl text-base leading-relaxed text-lastcall-smoke sm:text-lg">
                    I was managing the bar, closing out events, and then trying to rebuild hours
                    from scraps of paper. People were tired. I was tired. Hours got argued about.
                    Rates got argued about. I was fed up, so I built the thing I wanted at 11pm on
                    a Saturday: clock in, clock out, clear records, payroll done.
                  </p>
                </div>
                <div className="mt-6 flex items-start justify-between gap-4 border-t border-lastcall-line/80 pt-4">
                  <div>
                    <p className="font-display text-xl text-lastcall-cream">Constance</p>
                    <p className="text-sm text-lastcall-smoke">Bar Manager, The Tythe Barn</p>
                  </div>
                  <div className="rounded-2xl border border-lastcall-line bg-lastcall-ink/60 px-3 py-2 text-right">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-lastcall-haze">
                      Built for
                    </p>
                    <p className="text-sm font-semibold text-lastcall-cream">
                      real shifts, not demos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 lg:pt-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-lastcall-amber/30 bg-lastcall-amber/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-lastcall-amber">
                For the manager doing three jobs at once
              </div>
              <p className="max-w-xl text-lg leading-relaxed text-lastcall-smoke sm:text-xl">
                You are not &ldquo;operations&rdquo; in a neat little org chart. You are on the
                floor, fixing rota gaps, answering staff questions, and then somehow expected to do
                payroll without missing a beat.
              </p>
              <p className="max-w-xl text-lg leading-relaxed text-lastcall-cream">
                This page is for the person who says, &ldquo;I&rsquo;ll deal with it Monday,&rdquo;
                and then spends Monday untangling chaos.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  'No more scraps of paper',
                  'No more “whose shift was that?”',
                  'No more rebuilding weekends from memory',
                  'No more payroll guesswork',
                ].map((line, i) => (
                  <motion.div
                    key={line}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.35 }}
                    className="rounded-2xl border border-lastcall-line bg-lastcall-panel/50 px-4 py-3 text-sm text-lastcall-cream transition hover:-translate-y-0.5 hover:border-lastcall-amber/45 hover:bg-lastcall-panel"
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </header>
      </div>

      <main>
        <section className="border-y border-lastcall-line/80 bg-lastcall-panel/60 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div {...reveal} className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-lastcall-amber">
                The bit that feels too accurate
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-lastcall-cream sm:text-4xl">
                A normal Saturday night, if you&rsquo;re still doing hours the old way
              </h2>
              <p className="mt-4 text-base leading-relaxed text-lastcall-smoke sm:text-lg">
                This is not a fake problem statement. This is the exact kind of weekend that turns
                into a payroll nightmare.
              </p>
            </motion.div>

            <div className="mt-8 space-y-4 sm:mt-10">
              {nightmareMoments.map((moment, i) => (
                <motion.article
                  key={moment.time}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-lastcall-line bg-lastcall-ink/70 p-4 sm:p-5"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-lastcall-amber to-lastcall-brass opacity-70 transition group-hover:opacity-100" />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                    <div className="inline-flex w-fit rounded-full border border-lastcall-amber/30 bg-lastcall-amber/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-lastcall-amber">
                      {moment.time}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-snug text-lastcall-cream">
                        {moment.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-lastcall-smoke sm:text-base">
                        {moment.body}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.p
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.24 }}
              className="mt-8 max-w-4xl font-display text-2xl leading-tight text-lastcall-cream sm:text-3xl"
            >
              Payroll should not start with &ldquo;whose shift was that?&rdquo;
            </motion.p>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div {...reveal} className="mb-8 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-lastcall-amber">
                What you actually buy
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-lastcall-cream sm:text-4xl">
                Outcomes first. Features second.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-lastcall-smoke sm:text-lg">
                You do not need another dashboard. You need fewer Sunday-night headaches.
              </p>
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-3">
              {outcomes.map(({ icon: Icon, outcome, how }, i) => (
                <motion.article
                  key={outcome}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.08 }}
                  className="group rounded-3xl border border-lastcall-line bg-lastcall-panel/70 p-5 shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 hover:border-lastcall-amber/45 hover:bg-lastcall-panel sm:p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lastcall-amber/25 bg-lastcall-amber/10">
                      <Icon className="h-5 w-5 text-lastcall-amber" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-lastcall-haze">
                      Outcome
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl leading-tight text-lastcall-cream">
                    {outcome}
                  </h3>
                  <div className="mt-5 rounded-2xl border border-lastcall-line/80 bg-lastcall-ink/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-lastcall-haze">
                      How we do it
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-lastcall-smoke">{how}</p>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.16 }}
              className="mt-8 grid gap-4 rounded-3xl border border-lastcall-line bg-gradient-to-br from-lastcall-panel to-lastcall-ink p-4 sm:p-6 lg:grid-cols-[1.15fr_0.85fr]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-lastcall-amber">
                  How it works in practice
                </p>
                <div className="mt-4 space-y-3">
                  {mechanics.map(({ icon: Icon, title, text }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-lastcall-line/80 bg-lastcall-ink/70 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-lastcall-line bg-lastcall-panel">
                          <Icon className="h-4 w-4 text-lastcall-amber" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-lastcall-cream">{title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-lastcall-smoke">
                            {text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-lastcall-amber/25 bg-lastcall-amber/8 p-4 sm:p-5">
                <Scribble className="absolute right-4 top-4 h-5 w-24 rotate-6 text-lastcall-amber/60" />
                <p className="text-xs uppercase tracking-[0.2em] text-lastcall-amber">
                  Monday morning looks different
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-lastcall-line/70 bg-lastcall-ink/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-lastcall-haze">
                      Before
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-lastcall-smoke">
                      Message staff. Check paper sheets. Recalculate rates. Hope nobody disputes it.
                    </p>
                  </div>
                  <div className="rounded-xl border border-lastcall-amber/25 bg-lastcall-amber/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-lastcall-amber">
                      After
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-lastcall-cream">
                      Open portal. Review exceptions. Export. Send payroll. Go do your actual job.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="pb-16 pt-4 sm:pb-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              {...reveal}
              className="relative overflow-hidden rounded-[2rem] border border-lastcall-amber/25 bg-gradient-to-br from-lastcall-panel via-lastcall-navy to-lastcall-ink p-5 shadow-[0_24px_60px_rgba(0,0,0,0.38)] sm:p-8"
            >
              <div className="absolute -left-8 top-8 h-28 w-28 rounded-full border border-lastcall-amber/20" />
              <div className="absolute right-4 top-4 text-lastcall-amber/70">
                <Scribble className="h-6 w-28" />
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-lastcall-amber">
                Last orders CTA
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-lastcall-cream sm:text-4xl">
                Give yourself one less Sunday-night dread spiral.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-lastcall-smoke sm:text-lg">
                Start using the portal before your next busy weekend, so Monday payroll is a quick
                admin job instead of a reconstruction project.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-lastcall-amber px-5 py-4 text-base font-semibold text-lastcall-ink transition hover:bg-lastcall-cream sm:w-auto"
                >
                  Set it up before this weekend
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <p className="text-sm text-lastcall-smoke">
                  No sales call. Just log in and start with your team.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-lastcall-line bg-lastcall-ink/90 py-10 text-lastcall-smoke">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-lastcall-line bg-lastcall-panel">
              <Clock className="h-4 w-4 text-lastcall-amber" />
            </div>
            <div>
              <p className="font-display text-lg text-lastcall-cream">Employee Portal</p>
              <p className="text-xs uppercase tracking-[0.18em] text-lastcall-haze">
                built by someone who was done with timesheet chaos
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-lastcall-cream transition hover:text-lastcall-amber"
          >
            Open the portal
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
