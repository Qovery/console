import { Button } from '@qovery/shared/ui'
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
          <h2 className="text-base text-text-600 font-medium mb-5">
            Create your first Deployment Rules <span role="img">🕹</span>
          </h2>
          <Button link={linkNewRule}>Create Deployment Rule</Button>
        </div>
      </div>
      <HelpSidebar />
    </div>
  )
}

export default PlaceholderNoRules
