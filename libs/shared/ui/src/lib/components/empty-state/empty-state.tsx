import { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  className?: string
  imageWidth?: string
  dataTestId?: string
  children?: ReactNode
}

export function EmptyState(props: EmptyStateProps) {
  return (
    <div className={`flex flex-grow items-center justify-center ${props.className || ''}`}>
      <div
        className="text-center flex flex-col items-center justify-center w-[420px] m-auto mt-10"
        data-testid={props.dataTestId || 'placeholder-settings'}
      >
        <img
          className={`pointer-events-none user-none mb-5 ${props.imageWidth || 'w-[48px]'}`}
          src="/assets/images/event-placeholder-light.svg"
          alt="Event placeholder"
        />
        <p className="text-text-600 font-medium">{props.title}</p>
        {props.description && (
          <p data-testid="placeholder-settings-description" className="text-sm text-text-400 mt-1">
            {props.description}
          </p>
        )}
        {props.children}
      </div>
    </div>
  )
}

export default EmptyState
