import { Button, Icon } from '@qovery/shared/ui'

export interface PlanCardProps {
  title: string
  name: string
  text: string
  onClick: () => void
  loading: string
  price: number | 'custom'
  list: string[]
}

export function PlanCard(props: PlanCardProps) {
  const { name, title, text, price, loading, onClick, list } = props

  // Determine price display based on plan type
  const getPriceDisplay = () => {
    // Handle custom pricing
    if (price === 'custom') {
      return <span className="h5">Custom</span>
    }

    // Handle free plan (price = 0)
    if (price === 0) {
      return <span className="h5">Free</span>
    }

    // All other plans show pricing per month
    return (
      <>
        <span className="h5 mr-2 block">${price}</span> / month
      </>
    )
  }

  return (
    <div className="flex h-full w-full flex-col rounded border border-neutral bg-surface-neutral px-5 py-4">
      <h2 className="h5 mb-1 text-neutral">{title}</h2>
      <p className="mb-2 text-sm text-neutral-subtle">{text}</p>
      <p className="mb-4 flex items-center text-xs text-neutral">{getPriceDisplay()}</p>
      <Button
        type="button"
        className="mb-4 w-full justify-center"
        size="lg"
        onClick={() => onClick()}
        loading={loading === name}
      >
        Select plan
      </Button>
      <ul>
        {list.map((line: string, index: number) => (
          <li key={index} className="mb-2 text-sm text-neutral-subtle">
            <Icon iconName="circle-check" iconStyle="regular" className="mr-1.5 text-positive" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PlanCard
