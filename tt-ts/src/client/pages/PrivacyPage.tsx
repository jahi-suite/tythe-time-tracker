import React from 'react'
import { Link } from 'react-router-dom'

type PrivacySection = {
  id: string
  title: string
  body: React.ReactNode
}

const sections: PrivacySection[] = [
  {
    id: 'about',
    title: '1. About This Privacy Policy',
    body: (
      <>
        <p>
          This Privacy Policy explains how Kari Time handles personal data when hospitality venues
          use the service to record shifts, timesheets, and payroll-related information.
        </p>
        <p>
          This is a practical draft for a small SaaS business and is not legal advice. Venues using
          Kari Time should review their own employment and data protection obligations and take
          legal advice where needed.
        </p>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: '2. What We Collect',
    body: (
      <>
        <p>Depending on how a venue uses Kari Time, we may process:</p>
        <ul>
          <li>staff names and basic staff identifiers;</li>
          <li>staff roles or job positions;</li>
          <li>clock-in and clock-out times, shift dates, and worked hours;</li>
          <li>pay rates and payroll-related shift values entered by managers; and</li>
          <li>venue information such as venue name and team setup details.</li>
        </ul>
        <p>
          We may also process account and access information (for example login details, user
          roles, and basic system logs) so the service can operate securely.
        </p>
      </>
    ),
  },
  {
    id: 'why-we-collect',
    title: '3. Why We Collect and Use Data',
    body: (
      <>
        <p>We use personal data in Kari Time to provide the service, including to:</p>
        <ul>
          <li>record and display shifts and timesheets;</li>
          <li>support payroll preparation and exports;</li>
          <li>maintain records for compliance and internal checks;</li>
          <li>provide an audit trail of time entries and manager changes; and</li>
          <li>secure, maintain, and troubleshoot the platform.</li>
        </ul>
        <p>
          For venue staff data, the venue is usually the data controller and Kari Time acts as a
          service provider (processor) on the venue&apos;s behalf.
        </p>
      </>
    ),
  },
  {
    id: 'access',
    title: '4. Who Can Access the Data',
    body: (
      <>
        <p>Access is limited to people who need it to use or support the service:</p>
        <ul>
          <li>venue managers and authorised admins can access venue and staff records for their venue;</li>
          <li>staff can access their own records where the product provides staff access; and</li>
          <li>
            Kari Time (as service provider) may access data when reasonably necessary for support,
            maintenance, security, backups, or troubleshooting.
          </li>
        </ul>
        <p>
          We do not sell personal data. We only access data in line with providing and securing the
          service.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: '5. How Long We Keep Data',
    body: (
      <>
        <p>
          We keep data for as long as needed to provide Kari Time and for legitimate business and
          legal reasons, including payroll recordkeeping, audit trail requirements, and dispute
          resolution.
        </p>
        <p>
          In practice, records are typically kept until the venue deletes them or closes the
          account, unless longer retention is required by law or reasonably needed for compliance,
          security, or backup recovery.
        </p>
      </>
    ),
  },
  {
    id: 'deletion',
    title: '6. Account Closure, Retention and Deletion',
    body: (
      <>
        <p>
          If an account is closed, access to the service will be removed and the venue should
          export any records it needs before closure.
        </p>
        <p>
          After closure, we will delete or anonymise account data within a reasonable period,
          except where we need to retain limited information for legal obligations, fraud
          prevention, security logs, or backup restoration cycles.
        </p>
      </>
    ),
  },
  {
    id: 'third-parties',
    title: '7. Third Parties and Hosting',
    body: (
      <>
        <p>
          Kari Time may use technical providers (such as hosting and infrastructure services) to
          run the platform securely. Those providers process data only to the extent needed to host
          and support the service.
        </p>
        <p>
          We do not share venue staff data with third parties for marketing. If no subprocessor is
          used for a specific function, data remains stored securely within Kari Time systems and is
          not shared beyond what is needed to operate the service.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: '8. Security',
    body: (
      <>
        <p>
          We take reasonable technical and organisational steps to protect personal data against
          unauthorised access, loss, misuse, or disclosure. No system is completely risk-free, but
          we work to keep Kari Time secure and limit access appropriately.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    title: '9. Your Rights (UK GDPR)',
    body: (
      <>
        <p>Depending on the circumstances, individuals may have rights to:</p>
        <ul>
          <li>request access to their personal data;</li>
          <li>request correction of inaccurate data;</li>
          <li>request deletion of data (where applicable);</li>
          <li>object to or restrict certain processing; and</li>
          <li>make a complaint to the UK Information Commissioner&apos;s Office (ICO).</li>
        </ul>
        <p>
          If your data is held by Kari Time on behalf of a venue, please contact that venue first.
          We may direct requests to the relevant venue where it acts as data controller.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: '10. Contact and Complaints',
    body: (
      <>
        <p>
          If you have privacy questions or want to request access, correction, or deletion, contact
          the venue that uses Kari Time or contact Kari Time support using the contact details
          provided in the service.
        </p>
        <p>
          You also have the right to complain to the ICO in the UK if you believe your data has
          been handled unlawfully.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    body: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect product changes, legal
          requirements, or operational needs. The latest version will be made available in Kari
          Time and/or on the website.
        </p>
      </>
    ),
  },
]

export function PrivacyPage() {
  return (
    <div
      className="privacy-page"
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top right, rgba(200,133,58,0.16), transparent 46%), #12100e',
        color: '#f5f0e8',
        padding: '2rem 1rem 3rem',
      }}
    >
      <style>
        {`
          .privacy-page .privacy-prose p { margin: 0 0 0.8rem; }
          .privacy-page .privacy-prose p:last-child { margin-bottom: 0; }
          .privacy-page .privacy-prose ul {
            margin: 0 0 0.8rem;
            padding-left: 1.15rem;
            list-style: disc;
          }
          .privacy-page .privacy-prose li {
            margin: 0 0 0.35rem;
            color: rgba(245,240,232,0.78);
          }
          .privacy-page .privacy-prose li:last-child { margin-bottom: 0; }
        `}
      </style>
      <div
        style={{
          maxWidth: 860,
          margin: '0 auto',
          border: '1px solid rgba(200,133,58,0.22)',
          background: 'rgba(18,16,14,0.88)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid rgba(200,133,58,0.18)',
            background: 'linear-gradient(180deg, rgba(200,133,58,0.08), rgba(18,16,14,0))',
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#e8a855',
              fontSize: '0.76rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Kari Time
          </p>
          <h1
            style={{
              margin: '0.45rem 0 0',
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              lineHeight: 1.15,
              color: '#f5f0e8',
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ margin: '0.75rem 0 0', color: 'rgba(245,240,232,0.72)' }}>
            Effective date: 24 February 2026
          </p>
          <p style={{ margin: '0.4rem 0 0', color: 'rgba(245,240,232,0.58)' }}>
            Draft UK GDPR-focused privacy notice for a hospitality shift-tracking SaaS. Not legal
            advice.
          </p>
          <p style={{ margin: '0.9rem 0 0', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <Link to="/" style={linkStyle}>
              Back to home
            </Link>
            <Link to="/login" style={linkStyleMuted}>
              Go to login
            </Link>
          </p>
        </header>

        <main style={{ padding: '1.25rem' }}>
          <section
            style={{
              padding: '0.95rem 1rem',
              border: '1px solid rgba(200,133,58,0.16)',
              borderRadius: 10,
              background: 'rgba(200,133,58,0.05)',
              color: 'rgba(245,240,232,0.78)',
              lineHeight: 1.55,
            }}
          >
            <p style={{ margin: 0 }}>
              Kari Time is designed to help venues manage shift and payroll records. This page
              explains, in clear terms, what data is processed, why it is used, who can access it,
              and how long it is kept.
            </p>
          </section>

          <div style={{ marginTop: '1rem' }}>
            {sections.map((section) => (
              <section
                key={section.id}
                aria-labelledby={section.id}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(200,133,58,0.12)',
                }}
              >
                <h2
                  id={section.id}
                  style={{
                    margin: '0 0 0.7rem',
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: '1.3rem',
                    lineHeight: 1.2,
                    color: '#f5f0e8',
                  }}
                >
                  {section.title}
                </h2>
                <div className="privacy-prose" style={proseStyle}>
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

const linkStyle: React.CSSProperties = {
  color: '#12100e',
  background: '#c8853a',
  border: '1px solid #c8853a',
  borderRadius: 6,
  padding: '0.55rem 0.85rem',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '0.95rem',
}

const linkStyleMuted: React.CSSProperties = {
  color: '#f5f0e8',
  background: 'transparent',
  border: '1px solid rgba(245,240,232,0.22)',
  borderRadius: 6,
  padding: '0.55rem 0.85rem',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
}

const proseStyle: React.CSSProperties = {
  color: 'rgba(245,240,232,0.78)',
  lineHeight: 1.65,
}
