export interface FunnelFlowBodyProps {
  children: React.ReactNode
  helpSectionClassName?: string
  helpSection?: React.ReactNode
  customContentWidth?: string
}

export function FunnelFlowBody(props: FunnelFlowBodyProps) {
  return (
    <>
      {props.helpSection && (
        <div className="absolute h-full bg-white w-full pointer-events-none" style={{ left: '-30%' }}></div>
      )}
      <div className="flex w-full overflow-auto">
        <section className={`bg-white pt-14 w-full ${props.helpSection ? 'lg:w-[70%]' : 'overflow-auto'}`}>
          <div
            data-testid="funnel-body-content"
            className={`px-12 mx-auto relative pb-14 ${
              props.customContentWidth || 'max-w-content-with-navigation-left'
            }`}
          >
            {props.children}
          </div>
        </section>
        {props.helpSection && (
          <aside className="w-[30%] sticky top-0 pt-14 pl-10 hidden lg:block">
            <div
              data-testid="funnel-body-help"
              className={`bg-element-light-lighter-100 p-8 border-element-light-lighter-400 border-b border-l max-w-[22.5rem] ${
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
