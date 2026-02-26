import React from 'react'
import { Container } from './Container'
import { classNames } from './classNames'

type HeroProps = {
  eyebrow?: React.ReactNode
  title?: string
  titleLines?: [string, string] | [string] | string[]
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  meta?: React.ReactNode
  className?: string
}

export function Hero({ eyebrow, title, titleLines, subtitle, actions, meta, className }: HeroProps) {
  const [lineOne, lineTwo] = titleLines ?? (title ? [title] : [''])

  return (
    <section className={classNames('ks-hero-wrap', className)}>
      <Container className="ks-hero">
        {eyebrow ? <div className="ks-hero__eyebrow">{eyebrow}</div> : null}
        <h1 className="ks-hero__title">
          {lineOne}
          {lineTwo ? <span className="ks-hero__title-line">{lineTwo}</span> : null}
        </h1>
        {subtitle ? <p className="ks-hero__subtitle">{subtitle}</p> : null}
        {actions ? <div className="ks-hero__actions">{actions}</div> : null}
        {meta ? <div className="ks-hero__meta">{meta}</div> : null}
      </Container>
    </section>
  )
}
