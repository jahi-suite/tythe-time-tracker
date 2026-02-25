import React from 'react'
import { Card, Footer, Hero, Section, Steps, Tag, TopNav } from '../components'

export function MarketingLandingPage() {
  return (
    <div>
      <TopNav />
      <Hero
        eyebrow="Kari Time"
        titleLines={['Time tracking for', 'teams that ship']}
        subtitle="Payroll-ready time tracking for hospitality and operations teams. Minimal UI. Clear exports. Built by a small team that still uses what it ships."
        actions={
          <>
            <a href="/login" className="tt-btn">
              Log in
            </a>
            <a href="/venues" className="tt-btn tt-btn--secondary">
              Venues
            </a>
          </>
        }
        meta={
          <>
            <Tag tone="live">Live now</Tag>
            <Tag tone="idea">Idea stage</Tag>
            <Tag tone="radar">On the radar</Tag>
          </>
        }
      />

      <Section
        id="products"
        kicker="Products"
        title="Reusable product cards"
        lede="These cards are the shared building blocks for the landing pages and app-adjacent screens."
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

      <Section id="how-we-work" kicker="How We Work" title="Three steps. No theatre.">
        <Steps
          items={[
            {
              title: 'Start narrow',
              body: 'Ship the smallest version that handles a real shift, a real rota, or a real export.',
            },
            {
              title: 'Listen in production',
              body: 'Talk to operators. Keep the UI quiet. Cut the parts that slow people down.',
            },
            {
              title: 'Tighten and repeat',
              body: 'Make the useful path faster. Keep the product readable on a phone at 6am.',
            },
          ]}
        />
      </Section>

      <Footer />
    </div>
  )
}
