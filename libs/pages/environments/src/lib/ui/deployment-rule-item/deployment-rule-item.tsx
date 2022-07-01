import { Icon, Menu, MenuData, Skeleton } from '@console/shared/ui'
// import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL } from '@console/shared/router'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { useState } from 'react'

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
  // const { organizationId, projectId } = useParams()

  const getTime = (date: string) => {
    const converted = new Date(date)
    const hours = converted.getUTCHours()
    const minutes = converted.getUTCMinutes()
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`
  }

  const isWeekdays = (): boolean => {
    const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

    const checkIfWeekdays = weekdays.every((weekday) => {
      return weekDays.includes(weekday)
    })

    return checkIfWeekdays
  }

  const menu: MenuData = [
    // {
    //   items: [
    //     {
    //       name: 'Edit',
    //       contentLeft: <Icon name="icon-solid-pen" className="text-brand-400 text-sm" />,
    //       link: {
    //         url: `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_DEPLOYMENT_RULES_URL}/edit/${id}`,
    //       },
    //     },
    //   ],
    // },
    {
      items: [
        {
          name: 'Delete rule',
          textClassName: 'text-error-500',
          contentLeft: <Icon name="icon-solid-trash" className="text-error-500 text-sm" />,
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
          {upperCaseFirstLetter(day)?.slice(0, 3)}
          {index !== weekDays.length - 1 && ', '}
        </span>
      ))}
    </>
  )

  return (
    <div
      className={`${
        isLast ? 'rounded-b' : ''
      } border bg-element-light-lighter-200 border-element-light-lighter-500 flex px-5 py-4 -mt-px justify-between`}
    >
      <div className="border-r border-element-light-lighter-400">
        <Skeleton show={isLoading} width={180} height={20} className="mb-1">
          <h3 className="text-sm text-text-500 font-medium max-w-full truncate">{name}</h3>
        </Skeleton>
        <Skeleton show={isLoading} width={300} height={20}>
          <p className="text-xs text-text-500 max-w-full truncate">
            {getTime(startTime)}-{getTime(stopTime)}
            {isWeekdays() && weekDays.length < 7 ? ' - Running every weekday' : ''}
            {weekDays.length === 7 && ' - Running everyday'}
            {!isWeekdays() && weekDays.length !== 7 ? weekDaysList : ''}
          </p>
        </Skeleton>
      </div>
      <Skeleton show={isLoading} width={58} height={30}>
        <div className="flex border border-element-light-lighter-500 rounded h-[34px]">
          <span className="w-8 h-8 flex items-center rounded bg-white justify-center border-r border-element-light-lighter-500 text-text-400 text-xs cursor-pointer hover:bg-brand-50 hover:text-brand-500 transition">
            <Icon name="icon-solid-grip-lines" />
          </span>
          <Menu
            menus={menu}
            width={248}
            onOpen={(isOpen: boolean) => setMenuOpen(isOpen)}
            trigger={
              <span
                className={`w-8 h-8 flex items-center justify-center rounded text-text-400 text-xs bg-white cursor-pointer hover:bg-brand-50 hover:text-brand-500 transition ${
                  menuOpen ? 'bg-brand-50 !text-brand-500' : ''
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
