import React from 'react'
import { classNames } from './classNames'

type ContainerTag = keyof JSX.IntrinsicElements

type ContainerProps<T extends ContainerTag = 'div'> = {
  as?: T
  className?: string
  children: React.ReactNode
  narrow?: boolean
} & Omit<JSX.IntrinsicElements[T], 'as' | 'className' | 'children'>

export function Container<T extends ContainerTag = 'div'>({
  as,
  className,
  children,
  narrow = false,
  ...rest
}: ContainerProps<T>) {
  const Component = (as ?? 'div') as React.ElementType

  return (
    <Component
      className={classNames('ks-container', narrow && 'ks-container--narrow', className)}
      {...rest}
    >
      {children}
    </Component>
  )
}
