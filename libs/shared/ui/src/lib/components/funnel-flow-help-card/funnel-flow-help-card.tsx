import { IconEnum } from '@console/shared/enums'
import Icon from '../icon/icon'

export interface FunnelFlowHelpCardProps {
  title: string
  items: string[]
}

export function FunnelFlowHelpCard(props: FunnelFlowHelpCardProps) {
  return (
    <div>
      <Icon name={IconEnum.INFORMATION} viewBox="0 0 28 28" className="w-7 h-7 mb-4" />
      <h5 className="text-lg font-medium text-700 mb-4">{props.title}</h5>
      <ul className="list-disc pl-4 text-text-500 text-sm">
        {props.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default FunnelFlowHelpCard
