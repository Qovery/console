export interface FunnelFlowBodyProps {
  children: React.ReactNode
  helpSection?: React.ReactNode
}

export function FunnelFlowBody(props: FunnelFlowBodyProps) {
  return (
    <>
      <div className="absolute h-full bg-white w-full pointer-events-none" style={{ left: '-30%' }}></div>
      <div className="flex w-full overflow-auto">
        <section className="w-[70%] bg-white pt-14">
          <div data-testid="funnel-body-content" className="max-w-[32rem] mx-auto relative px-4 pb-14">
            {props.children}
          </div>
        </section>
        {props.helpSection && (
          <aside className="w-[30%] sticky top-0 pt-14 pl-10">
            <div
              data-testid="funnel-body-help"
              className="bg-element-light-lighter-100 p-8 border-element-light-lighter-400 border-b border-l max-w-[22.5rem]"
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
