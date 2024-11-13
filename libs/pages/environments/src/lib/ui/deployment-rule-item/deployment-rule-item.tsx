import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { Icon, Menu, type MenuData, Skeleton } from '@qovery/shared/ui'
import { dateToHours } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface DeploymentRuleItemProps {
  id: string
  name: string
  startTime: string
  stopTime: string
  weekDays: string[]
  isLast: boolean
  removeDeploymentRule: (id: string) => void
  isLoading?: boolean
  noDragDrop?: boolean
}

export function DeploymentRuleItem(props: DeploymentRuleItemProps) {
  const {
    id,
    name,
    startTime,
    stopTime,
    weekDays,
    isLast = false,
    isLoading = false,
    removeDeploymentRule,
    noDragDrop = false,
  } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const { organizationId, projectId } = useParams()

  const isWeekdays = (): boolean => {
    const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    return weekdays.every((weekday) => weekDays.includes(weekday))
  }

  const menu: MenuData = [
    {
      items: [
        {
          name: 'Edit rule',
          contentLeft: <Icon iconName="pen" iconStyle="regular" className="text-sm text-brand-500" />,
          link: {
            url: `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}/edit/${id}`,
          },
        },
      ],
    },
    {
      items: [
        {
          name: 'Delete rule',
          textClassName: '!text-red-600',
          contentLeft: <Icon iconName="trash-can" iconStyle="regular" className="text-sm text-red-600" />,
          onClick: () => removeDeploymentRule(id),
        },
      ],
    },
  ]

  const weekDaysList = (
    <>
      {' - '}
      {weekDays.map((day: string, index: number) => (
        <span key={index}>
          {upperCaseFirstLetter(day.toLowerCase())?.slice(0, 3)}
          {index !== weekDays.length - 1 && ', '}
        </span>
      ))}
    </>
  )

  return (
    <div
      data-testid="item"
      className={`${
        isLast ? 'rounded-b' : ''
      } -mt-px flex justify-between border border-neutral-250 bg-neutral-100 px-5 py-4`}
    >
      <div>
        <Skeleton show={isLoading} width={180} height={20} className="mb-1">
          <h3 className="max-w-full truncate text-sm font-medium text-neutral-400">{name}</h3>
        </Skeleton>
        <Skeleton show={isLoading} width={300} height={20}>
          <p data-testid="time" className="max-w-full truncate text-xs text-neutral-400">
            {dateToHours(startTime)} - {dateToHours(stopTime)}
            {isWeekdays() && weekDays.length < 7 ? ' - Running every weekday' : ''}
            {weekDays.length === 7 && ' - Running everyday'}
            {!isWeekdays() && weekDays.length !== 7 ? weekDaysList : ''}
          </p>
        </Skeleton>
      </div>
      <Skeleton show={isLoading} width={58} height={30}>
        <div className="flex h-[34px] overflow-hidden rounded border border-neutral-250">
          {!noDragDrop && (
            <span className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-neutral-250 bg-white text-xs text-neutral-350 transition hover:bg-brand-50 hover:text-brand-500">
              <Icon name="icon-solid-grip-lines" />
            </span>
          )}
          <Menu
            menus={menu}
            width={248}
            onOpen={(isOpen: boolean) => setMenuOpen(isOpen)}
            trigger={
              <span
                className={`flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-xs transition hover:bg-brand-50 hover:text-brand-500 ${
                  menuOpen ? 'bg-neutral-150 text-brand-500' : 'text-neutral-350'
                }`}
              >
                <Icon name="icon-solid-ellipsis-v" />
              </span>
            }
          />
        </div>
      </Skeleton>
    </div>
  )
}

export default DeploymentRuleItem
