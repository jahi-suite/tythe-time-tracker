import React from 'react'
import { Container } from './Container'
import { classNames } from './classNames'

type FooterProps = {
  email?: string
  company?: string
  className?: string
}

export function Footer({ email = 'jahi@karisuite.com', company = 'Kari Suite', className }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className={classNames('ks-footer-wrap', className)}>
      <Container className="ks-footer">
        <a href={`mailto:${email}`} className="ks-footer__email">
          {email}
        </a>
        <p className="ks-footer__meta">© {year} {company}. Small team. Real software.</p>
      </Container>
    </footer>
  )
}
