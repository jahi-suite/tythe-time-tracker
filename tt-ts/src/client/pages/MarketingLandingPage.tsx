import React from 'react'
import { Card, Footer, Hero, Section, Steps, Tag, TopNav } from '../components'

export function MarketingLandingPage() {
  return (
    <div>
      <TopNav />
      <Hero
        eyebrow="Kari Suite"
        titleLines={['Small team.', 'Real software.']}
        subtitle="Time tracking for teams that need clean exports, clear screens, and software that works in the real world."
        actions={
          <>
            <a href="/login" className="tt-btn">
              Open Kari Time
            </a>
            <a href="/venues" className="tt-btn tt-btn--secondary">
              Venues
            </a>
          </>
        }
        meta={
          <>
            <Tag tone="live">Live: Kari Time</Tag>
            <Tag tone="idea">Idea: Kari Rota</Tag>
            <Tag tone="radar">Radar: Kari Stock</Tag>
          </>
        }
      />

      <Section
        id="values"
        kicker="What We Value"
        title="Independent. Direct. Useful."
        lede="No roadmap theatre. Build tight. Ship it."
      >
        <div className="ks-card-grid">
          <Card title="Independent & self-funded">
            Small team decisions. No committee handoffs.
          </Card>
          <Card title="No VC. No roadmap theatre.">
            We build when the work is real and the tool earns its place.
          </Card>
          <Card title="Works in the real world.">
            Built for busy teams, phones in hand, mid-shift.
          </Card>
        </div>
      </Section>

      <Section
        id="products"
        kicker="Products"
        title="Three products. One standard."
        lede="Clear scope. Honest status. Ship the one that solves today's problem."
      >
        <div className="ks-card-grid">
          <Card
            tag={<Tag tone="live">Live now</Tag>}
            title="Kari Time"
            description="Shift tracking and payroll exports for real venues."
            href="/login"
            ctaLabel="Open app"
          />
          <Card
            tag={<Tag tone="idea">Idea stage</Tag>}
            title="Kari Rota"
            description="Planning and coverage tools without enterprise drag."
            ctaLabel="Coming later"
          >
            No roadmap theatre. Build when the need is real.
          </Card>
          <Card
            tag={<Tag tone="radar">On the radar</Tag>}
            title="Kari Stock"
            description="Lean stock tracking for small hospitality teams."
            ctaLabel="Watching"
          >
            Kept on the radar until it earns a build slot.
          </Card>
        </div>
      </Section>

      <Section
        id="how-we-work"
        kicker="How We Work"
        title="Three steps. No theatre."
        lede="Start with a real workflow. Tighten the useful path. Repeat."
      >
        <Steps
          items={[
            {
              title: 'Start with a real job',
              body: 'Pick one workflow that matters today. Make it usable end to end before adding more.',
            },
            {
              title: 'Ship tight',
              body: 'Keep the UI quiet, remove friction, and focus on the path people use every day.',
            },
            {
              title: 'Listen and iterate',
              body: 'Watch real usage, fix sharp edges fast, and keep improving what already works.',
            },
          ]}
        />
      </Section>

      <Section
        id="contact"
        kicker="CTA"
        title="Need time tracking that stays out of the way?"
        lede="Kari Time is live now. Start with the product or email us if you need a fit check."
      >
        <div className="ks-card-grid">
          <Card title="Open Kari Time" description="Log in and get to the clock, timesheet, and exports.">
            <a href="/login" className="tt-btn">
              Open app
            </a>
          </Card>
          <Card title="Email" description="Real inbox. Real response.">
            <a href="mailto:hello@karisuite.com" className="ks-card__cta">
              hello@karisuite.com
            </a>
          </Card>
          <Card title="How we build" description="Small team. Real software.">
            Build tight. Ship it. No roadmap theatre.
          </Card>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
