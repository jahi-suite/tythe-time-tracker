import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { venues } from '../api'

export function VerifyPendingPage() {
  const [searchParams] = useSearchParams()
  const venueId = searchParams.get('venueId')
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleResend = async () => {
    if (!venueId) return
    setLoading(true)
    setError('')
    try {
      await venues.resendVerification(venueId)
      setResent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <img
        src="/kari-logo.png"
        alt="Kari Suite"
        width={200}
        style={{ display: 'block', margin: '0 auto 1rem' }}
      />
      <div className="login-hero">
        <p className="login-eyebrow">Verification required</p>
        <h1 className="login-title">Verify your email</h1>
        <p className="login-subtitle">
          We've sent a verification link to your admin email address.
          Please click the link in that email to activate your venue.
        </p>
      </div>
      
      <div className="login-form" style={{ textAlign: 'center' }}>
        {resent ? (
          <p className="message-success">A new verification link has been sent!</p>
        ) : (
          <>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--tt-text-muted)', lineHeight: '1.5' }}>
              Didn't receive the email? Check your spam folder or click below to resend.
            </p>
            <button onClick={handleResend} disabled={loading || !venueId}>
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
          </>
        )}
        
        {error && <p className="message-error" style={{ marginTop: '1rem' }}>{error}</p>}
        
        <div style={{ marginTop: '2rem' }}>
          <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--tt-accent)' }}>
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
