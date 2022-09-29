import { IconEnum } from '@qovery/shared/enums'
import { HelpSection, HelpSectionProps } from '../help-section/help-section'
import Icon from '../icon/icon'

export interface FunnelFlowHelpCardProps {
  title: string
  items: string[]
  className?: string
  helpSectionProps?: HelpSectionProps
}

export function FunnelFlowHelpCard(props: FunnelFlowHelpCardProps) {
  return (
    <div className={`${props.className || ''}`}>
      <Icon name={IconEnum.INFORMATION} viewBox="0 0 28 28" className="w-7 h-7 mb-4" />
      <h5 className="text-lg font-medium text-700 mb-4">{props.title}</h5>
      <ul className={`list-disc pl-4 text-text-500 text-sm ${props.helpSectionProps && 'mb-8'}`}>
        {props.items.map((item, index) => (
          <li className="mb-3" key={index}>
            {item}
          </li>
        ))}
      </ul>
      {props.helpSectionProps && <HelpSection className="-mx-8 px-8 pb-0" {...props.helpSectionProps} />}
    </div>
  )
}

export default FunnelFlowHelpCard
