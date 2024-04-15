import { useNavigate } from 'react-router-dom'
import { Button } from '@qovery/shared/ui'

export interface PlaceholderNoRulesProps {
  linkNewRule: string
}

export function PlaceholderNoRules({ linkNewRule }: PlaceholderNoRulesProps) {
  const navigate = useNavigate()

  return (
    <div className="flex-grow overflow-y-auto flex">
      <div className="flex justify-center items-center flex-grow">
        <div className="flex flex-col items-center">
          <img
            className="pointer-events-none user-none mb-5"
            src="/assets/images/event-placeholder-light.svg"
            alt="Event placeholder"
          />
          <h2 className="text-base text-neutral-400 font-medium mb-5">
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
