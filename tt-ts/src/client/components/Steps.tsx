import React from 'react'

export type StepItem = {
  title: React.ReactNode
  body: React.ReactNode
}

type StepsProps = {
  items: [StepItem, StepItem, StepItem] | StepItem[]
  className?: string
}

export function Steps({ items, className }: StepsProps) {
  return (
    <ol className={`ks-steps${className ? ` ${className}` : ''}`}>
      {items.map((item, index) => (
        <li className="ks-steps__item" key={`${index + 1}`}>
          <div className="ks-steps__index" aria-hidden="true">
            {index + 1}
          </div>
          <h3 className="ks-steps__title">{item.title}</h3>
          <p className="ks-steps__body">{item.body}</p>
        </li>
      ))}
    </ol>
  )
}
