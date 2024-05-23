import { type PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../button/button'
import Icon from '../icon/icon'

export interface FunnelFlowProps extends PropsWithChildren {
  totalSteps: number
  currentStep: number
  currentTitle: string
  exitTo?: string
  onExit?: () => void
  portal?: boolean
}

const FunnelFlowContent = (props: FunnelFlowProps) => {
  return (
    <div className="absolute inset-0 left-0 top-0 flex min-h-0 flex-col scroll-auto bg-neutral-150">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5">
        <div className="flex h-full items-center">
          <div className="pr-4">
            <img className="w-[90px] shrink-0" src="assets/logos/logo-black.svg" alt="Qovery logo black" />
          </div>
          <div className="flex h-full items-center gap-4 border-l border-l-neutral-200 pl-4">
            <div className="flex h-5 items-center rounded-md bg-brand-500 px-1 text-2xs font-medium text-white">
              {props.currentStep}/{props.totalSteps}
            </div>
            <h4 className="text-sm font-medium text-neutral-400">{props.currentTitle}</h4>
          </div>
        </div>
        {props.onExit && (
          <div className="flex h-full items-center border-l border-l-neutral-200 pl-5">
            <Button onClick={props.onExit} variant="surface" size="md">
              Close <Icon iconName="xmark" iconStyle="regular" className="ml-2 text-base" />
            </Button>
          </div>
        )}
      </header>
      <div data-testid="progress-bar-wrapper" className="relative h-[6px] shrink-0 bg-neutral-250">
        <div
          data-testid="progress-bar"
          style={{ transform: `scaleX(${props.currentStep / props.totalSteps})` }}
          className="absolute inset-0 h-full origin-left bg-brand-500 transition-transform duration-700 ease-in-out"
        />
      </div>
      <div data-testid="funnel-content" className="relative flex min-h-0 flex-grow">
        {props.children}
      </div>
    </div>
  )
}

export function FunnelFlow(props: FunnelFlowProps) {
  if (props.portal) {
    const target = document.body
    return createPortal(<FunnelFlowContent {...props} />, target)
  } else {
    return <FunnelFlowContent {...props} />
  }
}

export default FunnelFlow
