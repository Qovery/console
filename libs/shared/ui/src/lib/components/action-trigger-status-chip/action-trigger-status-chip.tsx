import { type DeploymentHistoryTriggerAction, type StateEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import Icon from '../icon/icon'
import Indicator from '../indicator/indicator'
import StatusChip from '../status-chip/status-chip'
import Tooltip from '../tooltip/tooltip'

export function TriggerActionIcon({
  triggerAction,
  className,
}: {
  triggerAction: DeploymentHistoryTriggerAction | undefined
  className?: string
}) {
  return (
    <span className={className}>
      {match(triggerAction)
        .with(undefined, 'UNKNOWN', () => <Icon iconStyle="regular" iconName="question-circle" />)
        .with('DELETE', () => <Icon iconStyle="solid" iconName="trash-can-xmark" />)
        .with('DEPLOY', () => <Icon iconStyle="solid" iconName="play" />)
        .with('RESTART', () => <Icon iconStyle="solid" iconName="arrow-rotate-right" />)
        .with('STOP', () => <Icon iconStyle="solid" iconName="stop" />)
        .exhaustive()}
    </span>
  )
}

export interface ActionTriggerStatusChipInterface {
  triggerAction: DeploymentHistoryTriggerAction | undefined
  status?: StateEnum
}

export function ActionTriggerStatusChip({ status, triggerAction }: ActionTriggerStatusChipInterface) {
  return (
    <Tooltip
      content={
        <>
          Action: {upperCaseFirstLetter(triggerAction)} <br /> Status: {upperCaseFirstLetter(status).replace(/_/g, ' ')}
        </>
      }
      side="bottom"
    >
      <span>
        <Indicator
          align="end"
          side="right"
          content={status && <StatusChip className="relative -left-0.5 -top-1" status={status} disabledTooltip />}
        >
          <TriggerActionIcon
            triggerAction={triggerAction}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-400 text-sm text-neutral-250"
          />
        </Indicator>
      </span>
    </Tooltip>
  )
}

export default ActionTriggerStatusChip
