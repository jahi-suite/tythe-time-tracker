import React from 'react'

/**
 * Privacy Policy page: styled HTML brochure.
 * Served from public/privacy-policy.html.
 * Nav links use target="_top" to break out of iframe.
 */
export function PrivacyPage() {
  return (
    <iframe
      src="/privacy-policy.html"
      title="Privacy Policy — Kari Time"
      className="fixed inset-0 h-full w-full border-0"
    />
  )
}
