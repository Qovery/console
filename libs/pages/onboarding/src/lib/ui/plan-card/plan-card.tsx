import { PlanEnum } from 'qovery-typescript-axios'
import { Button, Icon } from '@qovery/shared/ui'

export interface PlanCardProps {
  title: string
  name: string
  text: string
  onClick: () => void
  loading: string
  price: number
  list: string[]
}

export function PlanCard(props: PlanCardProps) {
  const { name, title, text, price, loading, onClick, list } = props

  return (
    <div className="bg-neutral-100 border border-neutral-250 px-5 py-4 rounded lg:w-80">
      <h2 className="h5 mb-1">{title}</h2>
      <p className="text-sm text-neutral-400 mb-2">{text}</p>
      <p className="flex items-center text-neutral-400 text-xs mb-4">
        {name !== PlanEnum.ENTERPRISE ? (
          <>
            <span className="h5 block mr-2">${price}</span> per user/month
          </>
        ) : (
          <span className="h5">Custom</span>
        )}
      </p>
      <Button
        type="button"
        className="w-full justify-center mb-4"
        size="lg"
        onClick={() => onClick()}
        loading={loading === name}
      >
        Select plan
      </Button>
      <ul>
        {list.map((line: string, index: number) => (
          <li key={index} className="text-neutral-400 text-xs mb-2 last:mb-10">
            <Icon iconName="check" className="text-green-500 mr-1.5" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PlanCard
