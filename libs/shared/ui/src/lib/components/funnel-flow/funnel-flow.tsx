import React from 'react'
import { createPortal } from 'react-dom'
import Button, { ButtonStyle } from '../buttons/button/button'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

export interface FunnelFlowProps {
  totalSteps: number
  currentStep: number
  currentTitle: string
  children: React.ReactNode
  exitTo?: string
  onExit?: () => void
  portal?: boolean
}

const FunnelFlowContent = (props: FunnelFlowProps) => {
  return (
    <div className="absolute top-0 left-0 inset-0 bg-element-light-lighter-300 scroll-auto flex flex-col min-h-0 z-20">
      <header className="h-16 px-5 bg-white flex shrink-0 items-center justify-between">
        <div className="flex items-center h-full">
          <div className="pr-4">
            <img className="w-[90px] shrink-0" src="assets/logos/logo-black.svg" alt="Qovery logo black" />
          </div>
          <div className="flex h-full items-center gap-4 pl-4 border-l border-l-element-light-lighter-400">
            <div className="h-5 px-1 bg-element-light-lighter-400 font-medium rounded-sm text-text-400 text-xs flex items-center">
              {props.currentStep}/{props.totalSteps}
            </div>
            <h4 className="text-text-600 text-sm font-medium">{props.currentTitle}</h4>
          </div>
        </div>
        {props.onExit && (
          <div className="border-l border-l-element-light-lighter-400 pl-4 h-full flex items-center">
            <Button onClick={props.onExit} style={ButtonStyle.STROKED} className="btn--no-min-w">
              Close <Icon name={IconAwesomeEnum.CROSS} className="ml-2" />
            </Button>
          </div>
        )}
      </header>
      <div data-testid="progress-bar-wrapper" className="h-[6px] bg-element-light-lighter-500 relative shrink-0">
        <div
          data-testid="progress-bar"
          style={{ transform: `scaleX(${props.currentStep / props.totalSteps})` }}
          className="h-full absolute origin-left transition-transform duration-700 ease-in-out inset-0 bg-brand-500"
        />
      </div>
      <div data-testid="funnel-content" className="flex-grow min-h-0 flex relative">
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
