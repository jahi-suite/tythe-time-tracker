import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clock,
  DollarSign,
  FileSpreadsheet,
  Users,
  Shield,
  ChevronRight,
  CheckCircle2,
  FileText,
} from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
}

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
}

export function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-barn-cream font-sans text-barn-charcoal antialiased">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-barn-green/5 via-transparent to-barn-tan/10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-barn-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-barn-tan/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-barn-green flex items-center justify-center">
              <Clock className="w-5 h-5 text-barn-cream" />
            </div>
            <span className="font-display font-semibold text-barn-green text-lg">Employee Portal</span>
          </div>
          <Link
            to="/login"
            className="text-barn-green font-semibold hover:text-barn-brown transition-colors px-4 py-2"
          >
            Log in
          </Link>
        </nav>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-barn-green-muted font-semibold text-sm uppercase tracking-wider mb-3 sm:mb-4">
              For barns, wedding venues & boutique hospitality
            </p>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-barn-charcoal leading-tight">
              Stop chasing timesheets.{' '}
              <span className="text-barn-green">Start running your venue.</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-barn-text-muted max-w-2xl leading-relaxed">
              Clock in, export, done. Built for the way you work — no spreadsheets, no paper, no
              month-end chaos.
            </p>
            <Link
              to="/login"
              className="mt-6 sm:mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-barn-brown hover:bg-barn-green text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Pain Point */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="max-w-3xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-barn-charcoal">
              Still tracking shifts on paper?
            </h2>
            <p className="mt-6 text-lg text-barn-text-muted leading-relaxed">
              Scattered sheets. Late submissions. Payroll headaches. The last thing you need when
              you're running events, managing staff, and keeping guests happy.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Chasing signatures at month-end',
                'Manual rate calculations — standard, enhanced, supervisor',
                'No audit trail when disputes arise',
              ].map((item, i) => (
                <motion.li
                  key={item}
                  {...stagger}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-barn-charcoal"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-barn-tan/30 text-barn-brown flex items-center justify-center text-[10px] font-bold">
                    ×
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-barn-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeIn}
            className="font-display text-3xl sm:text-4xl font-bold text-barn-charcoal text-center mb-4"
          >
            Everything you need. Nothing you don't.
          </motion.h2>
          <motion.p
            {...fadeIn}
            className="text-center text-barn-text-muted text-lg max-w-2xl mx-auto mb-16"
          >
            Built for small teams. Payroll-ready in one click.
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Clock in & out',
                desc: 'One tap. Staff clock in from their phone. No paper, no fuss.',
              },
              {
                icon: DollarSign,
                title: 'Pay rates, automatic',
                desc: 'Standard, enhanced (night), supervisor. Set once, calculated forever.',
              },
              {
                icon: FileText,
                title: 'Timesheets',
                desc: 'Personal and manager views. Always up to date, always accurate.',
              },
              {
                icon: FileSpreadsheet,
                title: 'Export',
                desc: 'Excel & PDF. One click. Payroll-ready for your accountant.',
              },
              {
                icon: Users,
                title: 'Manager dashboard',
                desc: 'See everyone. Add, edit, approve. Quick export all staff.',
              },
              {
                icon: Shield,
                title: 'Audit log',
                desc: 'Who changed what, when. Full traceability for peace of mind.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                {...fadeIn}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-barn-tan/20 hover:shadow-md hover:border-barn-tan/40 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-barn-green/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-barn-green" />
                </div>
                <h3 className="font-display text-xl font-semibold text-barn-charcoal">{title}</h3>
                <p className="mt-3 text-barn-text-muted">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeIn}
            className="font-display text-3xl sm:text-4xl font-bold text-barn-charcoal text-center mb-16"
          >
            How it works
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              { step: 1, title: 'Add your team', desc: 'Create accounts, set pay rates. One-time setup.' },
              { step: 2, title: 'Staff clock in', desc: 'From phone or tablet. Times logged automatically.' },
              { step: 3, title: 'Export, done', desc: 'One click. Excel or PDF. Send to payroll.' },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                {...fadeIn}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="inline-flex w-14 h-14 rounded-full bg-barn-green text-white font-display font-bold text-xl items-center justify-center mb-6">
                  {step}
                </div>
                {i < 2 && (
                  <div className="hidden sm:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-barn-tan/40" />
                )}
                <h3 className="font-display text-xl font-semibold text-barn-charcoal">{title}</h3>
                <p className="mt-3 text-barn-text-muted">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-barn-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeIn}
            className="font-display text-3xl sm:text-4xl font-bold text-barn-charcoal text-center mb-16"
          >
            Trusted by venue owners
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              {
                quote:
                  'We went from paper chaos to payroll-ready in a week. Game changer. No more chasing staff for timesheets.',
                author: 'Sarah Mitchell',
                role: 'Wedding Venue Owner, The Old Barn',
              },
              {
                quote:
                  'Finally, something that understands our rates. Standard, enhanced, supervisor — all automatic. No more spreadsheets.',
                author: 'James Chen',
                role: 'Boutique Hotel Manager',
              },
            ].map(({ quote, author, role }, i) => (
              <motion.div
                key={author}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-barn-tan/20"
              >
                <CheckCircle2 className="w-10 h-10 text-barn-green/60 mb-4" />
                <blockquote className="text-barn-charcoal text-lg leading-relaxed">&ldquo;{quote}&rdquo;</blockquote>
                <footer className="mt-6">
                  <cite className="font-semibold text-barn-charcoal not-italic">{author}</cite>
                  <p className="text-sm text-barn-text-muted mt-0.5">{role}</p>
                </footer>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-barn-green">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeIn}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Get started. No credit card. Set up in minutes.
            </h2>
            <p className="mt-4 text-barn-cream/90 text-lg">
              Add your team, set your rates, and never chase a timesheet again.
            </p>
            <Link
              to="/login"
              className="mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-barn-green hover:bg-barn-cream font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-barn-charcoal text-barn-cream/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-barn-tan/30 flex items-center justify-center">
              <Clock className="w-4 h-4 text-barn-cream" />
            </div>
            <span className="font-display font-semibold text-barn-cream">
              Employee Portal — The Tythe Barn
            </span>
          </div>
          <p className="text-sm text-barn-cream/60">Powered by Kari Suite</p>
        </div>
      </footer>
    </div>
  )
}
