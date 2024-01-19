import { IconEnum } from '@qovery/shared/enums'
import { Heading } from '../heading/heading'
import { HelpSection, type HelpSectionProps } from '../help-section/help-section'
import { Icon } from '../icon/icon'
import { Section } from '../section/section'

export interface FunnelFlowHelpCardProps {
  title: string
  items: string[]
  className?: string
  helpSectionProps?: HelpSectionProps
}

export function FunnelFlowHelpCard(props: FunnelFlowHelpCardProps) {
  return (
    <Section className={`${props.className || ''}`}>
      <Icon name={IconEnum.INFORMATION} viewBox="0 0 28 28" className="w-7 h-7 mb-4" />
      {/* Hardcoded h2 here because help card should never be the main content */}
      <Heading className="mb-4" level={2}>
        {props.title}
      </Heading>
      <ul className={`list-disc pl-4 text-neutral-400 text-sm ${props.helpSectionProps && 'mb-8'}`}>
        {props.items.map((item, index) => (
          <li className="mb-3" key={index}>
            {item}
          </li>
        ))}
      </ul>
      {props.helpSectionProps && <HelpSection className="-mx-8 px-8 pb-0" {...props.helpSectionProps} />}
    </Section>
  )
}

export default FunnelFlowHelpCard
