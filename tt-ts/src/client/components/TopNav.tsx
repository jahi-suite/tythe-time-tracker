import React from 'react'
import { Container } from './Container'
import { classNames } from './classNames'

export type TopNavLink = {
  label: string
  href: string
}

export type TopNavAction = {
  label: string
  href: string
}

type TopNavProps = {
  brandLabel?: string
  brandHref?: string
  links?: TopNavLink[]
  cta?: TopNavAction
  className?: string
}

export function TopNav({
  brandLabel = 'Kari Suite',
  brandHref = '/',
  links = [
    { label: 'Products', href: '#products' },
    { label: 'About', href: '#how-we-work' },
    { label: 'Privacy', href: '/privacy' },
  ],
  cta = { label: 'Log in', href: '/login' },
  className,
}: TopNavProps) {
  return (
    <header className={classNames('ks-topnav-wrap', className)}>
      <Container as="nav" className="ks-topnav" aria-label="Primary">
        <a href={brandHref} className="ks-topnav__brand">
          {brandLabel}
        </a>
        <div className="ks-topnav__links">
          {links.map((link) => (
            <a key={`${link.label}-${link.href}`} href={link.href} className="ks-topnav__link">
              {link.label}
            </a>
          ))}
          {cta && (
            <a href={cta.href} className="tt-btn tt-btn--secondary ks-topnav__cta">
              {cta.label}
            </a>
          )}
        </div>
      </Container>
    </header>
  )
}
