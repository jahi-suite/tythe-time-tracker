import React from 'react'
import { classNames } from './classNames'

type CardProps = {
  title: React.ReactNode
  description?: React.ReactNode
  tag?: React.ReactNode
  href?: string
  ctaLabel?: string
  className?: string
  children?: React.ReactNode
}

export function Card({ title, description, tag, href, ctaLabel, className, children }: CardProps) {
  return (
    <article className={classNames('ks-card', className)}>
      {tag ? <div className="ks-card__tag">{tag}</div> : null}
      <h3 className="ks-card__title">{title}</h3>
      {description ? <p className="ks-card__description">{description}</p> : null}
      {children ? <div className="ks-card__body">{children}</div> : null}
      {href && ctaLabel ? (
        <a href={href} className="ks-card__cta">
          {ctaLabel}
        </a>
      ) : null}
    </article>
  )
}
