import { type PropsWithChildren, type ReactNode } from 'react'

export interface FunnelFlowBodyProps {
  helpSectionClassName?: string
  helpSection?: ReactNode
  customContentWidth?: string
}

export function FunnelFlowBody(props: PropsWithChildren<FunnelFlowBodyProps>) {
  return (
    <>
      {props.helpSection && (
        <div className="pointer-events-none absolute h-full w-full bg-white" style={{ left: '-30%' }}></div>
      )}
      <div className="flex w-full overflow-auto">
        <section className={`w-full bg-white pt-14 ${props.helpSection ? 'lg:w-[70%]' : 'overflow-auto'}`}>
          <div
            data-testid="funnel-body-content"
            className={`relative mx-auto px-8 pb-14 ${
              props.customContentWidth || 'max-w-content-with-navigation-left'
            }`}
          >
            {props.children}
          </div>
        </section>
        {props.helpSection && (
          <aside className="sticky top-0 hidden w-[30%] pl-10 pt-14 lg:block">
            <div
              data-testid="funnel-body-help"
              className={`max-w-[22.5rem] rounded border-b border-l border-neutral-200 bg-neutral-50 p-8 ${
                props.helpSectionClassName || ''
              }`}
            >
              {props.helpSection}
            </div>
          </aside>
        )}
      </div>
    </>
  )
}

export default FunnelFlowBody
