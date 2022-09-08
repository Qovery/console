export interface FunnelFlowBodyProps {
  children: React.ReactNode
  helpSection?: React.ReactNode
}

export function FunnelFlowBody(props: FunnelFlowBodyProps) {
  return (
    <div className="flex w-full overflow-auto">
      <section className="flex-[7] bg-white pt-14">
        <div className="max-w-funnel-flow-body-content mx-auto relative px-4">{props.children}</div>
      </section>
      <aside className="flex-[3] sticky top-0 pt-14 pl-10">
        <div className="bg-element-light-lighter-100 p-8 border-element-light-lighter-400 border-b border-l max-w-[22.5rem]">
          {props.helpSection}
        </div>
      </aside>
    </div>
  )
}

export default FunnelFlowBody
