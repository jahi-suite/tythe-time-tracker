import React from 'react'
import { classNames } from './classNames'

type TagTone = 'default' | 'live' | 'idea' | 'radar'

type TagProps = {
  tone?: TagTone
  children: React.ReactNode
  className?: string
}

export function Tag({ tone = 'default', children, className }: TagProps) {
  return <span className={classNames('tt-tag', `ks-tag--${tone}`, className)}>{children}</span>
}
