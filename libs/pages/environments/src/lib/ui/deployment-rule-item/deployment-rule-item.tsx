import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { Icon, Menu, type MenuData, Skeleton } from '@qovery/shared/ui'
import { dateToHours } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface DeploymentRuleItemProps {
  id: string
  name: string
  startTime: string
  stopTime: string
  weekDays: string[]
  isLast: boolean
  isLoading?: boolean
  removeDeploymentRule: (id: string) => void
}

export function DeploymentRuleItem(props: DeploymentRuleItemProps) {
  const { id, name, startTime, stopTime, weekDays, isLast = false, isLoading = false, removeDeploymentRule } = props
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
          contentLeft: <Icon name="icon-solid-pen" className="text-brand-400 text-sm" />,
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
          textClassName: '!text-red-500',
          contentLeft: <Icon name="icon-solid-trash" className="text-red-500 text-sm" />,
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
      } border bg-neutral-100 border-neutral-250 flex px-5 py-4 -mt-px justify-between`}
    >
      <div>
        <Skeleton show={isLoading} width={180} height={20} className="mb-1">
          <h3 className="text-sm text-neutral-400 font-medium max-w-full truncate">{name}</h3>
        </Skeleton>
        <Skeleton show={isLoading} width={300} height={20}>
          <p data-testid="time" className="text-xs text-neutral-400 max-w-full truncate">
            {dateToHours(startTime)} - {dateToHours(stopTime)}
            {isWeekdays() && weekDays.length < 7 ? ' - Running every weekday' : ''}
            {weekDays.length === 7 && ' - Running everyday'}
            {!isWeekdays() && weekDays.length !== 7 ? weekDaysList : ''}
          </p>
        </Skeleton>
      </div>
      <Skeleton show={isLoading} width={58} height={30}>
        <div className="flex border border-neutral-250 rounded h-[34px] overflow-hidden">
          <span className="w-8 h-8 flex items-center bg-white justify-center border-r border-neutral-250 text-neutral-350 text-xs cursor-pointer hover:bg-brand-50 hover:text-brand-500 transition">
            <Icon name="icon-solid-grip-lines" />
          </span>
          <Menu
            menus={menu}
            width={248}
            onOpen={(isOpen: boolean) => setMenuOpen(isOpen)}
            trigger={
              <span
                className={`w-8 h-8 flex items-center justify-center text-xs bg-white cursor-pointer hover:bg-brand-50 hover:text-brand-500 transition ${
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
