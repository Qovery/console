import { Button } from '@console/shared/ui'
import HelpSidebar from '../help-sidebar/help-sidebar'

export interface PlaceholderNoRulesProps {
  linkNewRule: string
}

export function PlaceholderNoRules(props: PlaceholderNoRulesProps) {
  const { linkNewRule } = props

  return (
    <div className="flex-grow overflow-y-auto flex">
      <div className="flex justify-center items-center flex-grow">
        <div className="flex flex-col items-center">
          <img
            className="w-12 pointer-events-none user-none mb-5"
            src="/assets/images/event-placeholder-light.svg"
            alt="Event placeholder"
          />
          <h2 className="text-base text-text-600 font-medium mb-1">
            Create your first Deployment Rules <span role="img">🕹</span>
          </h2>
          <p className="text-sm text-text-500 max-w-[420px] text-center mb-5">
            Events enable you to Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.
          </p>
          <Button link={linkNewRule}>Create Deployment Rule</Button>
        </div>
      </div>
      <HelpSidebar />
    </div>
  )
}

export default PlaceholderNoRules
