import React from 'react'
import { Container } from './Container'
import { classNames } from './classNames'

type SectionTag = 'section' | 'div'
type HeadingTag = 'h2' | 'h3'

type SectionProps = {
  id?: string
  as?: SectionTag
  headingAs?: HeadingTag
  kicker?: React.ReactNode
  title?: React.ReactNode
  lede?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Section({
  id,
  as = 'section',
  headingAs = 'h2',
  kicker,
  title,
  lede,
  className,
  children,
}: SectionProps) {
  const Component = as as React.ElementType
  const Heading = headingAs as React.ElementType

  return (
    <Component id={id} className={classNames('ks-section-wrap', className)}>
      <Container className="ks-section">
        {(kicker || title || lede) && (
          <header className="ks-section__header">
            {kicker ? <p className="ks-section__kicker">{kicker}</p> : null}
            {title ? <Heading className="ks-section__title">{title}</Heading> : null}
            {lede ? <p className="ks-section__lede">{lede}</p> : null}
          </header>
        )}
        {children}
      </Container>
    </Component>
  )
}
