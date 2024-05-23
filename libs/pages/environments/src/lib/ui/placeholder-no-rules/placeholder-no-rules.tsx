import { useNavigate } from 'react-router-dom'
import { Button } from '@qovery/shared/ui'

export interface PlaceholderNoRulesProps {
  linkNewRule: string
}

export function PlaceholderNoRules({ linkNewRule }: PlaceholderNoRulesProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-grow overflow-y-auto">
      <div className="flex flex-grow items-center justify-center">
        <div className="flex flex-col items-center">
          <img
            className="user-none pointer-events-none mb-5"
            src="/assets/images/event-placeholder-light.svg"
            alt="Event placeholder"
          />
          <h2 className="mb-5 text-base font-medium text-neutral-400">
            Create your first Deployment Rules <span role="img">🕹</span>
          </h2>
          <Button size="lg" onClick={() => navigate(linkNewRule)}>
            Create Deployment Rule
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PlaceholderNoRules
