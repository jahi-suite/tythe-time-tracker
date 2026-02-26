import React from 'react'

/**
 * Marketing landing page: Kari Time HTML.
 * Served from public/kari-time-marketing.html.
 * "Log in" and CTAs link to /login (target="_top" to break out of iframe).
 */
export function MarketingLandingPage() {
  return (
    <iframe
      src="/kari-time-marketing.html"
      title="Kari Time — Payroll-ready shift tracking for hospitality venues"
      className="fixed inset-0 h-full w-full border-0"
    />
  )
}
