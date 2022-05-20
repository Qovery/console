import { Icon, Menu, MenuData } from '@console/shared/ui'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { useState } from 'react'

/* eslint-disable-next-line */
export interface DeploymentRuleItemProps {
  name: string
  startTime: string
  stopTime: string
  weekDays: string[]
  isLast: boolean
}

export function DeploymentRuleItem(props: DeploymentRuleItemProps) {
  const { name, startTime, stopTime, weekDays, isLast = false } = props
  const [menuOpen, setMenuOpen] = useState(false)

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
    {
      items: [
        {
          name: 'Edit',
          contentLeft: <Icon name="icon-solid-pen" className="text-brand-400 text-sm" />,
        },
      ],
    },
    {
      items: [
        {
          name: 'Delete rule',
          textClassName: '!text-error-500',
          contentLeft: <Icon name="icon-solid-trash" className="text-error-500 text-sm" />,
        },
      ],
    },
  ]

  return (
    <div
      className={`${isLast ? 'rounded-b' : ''} border border-element-light-lighter-400 h-11 flex -mt-[1px] bg-white`}
    >
      <div className="px-4 flex items-center border-r border-element-light-lighter-400 w-4/12">
        <h3 className="text-sm text-text-500 font-medium max-w-full truncate">{name}</h3>
      </div>
      <div className="px-4 flex items-center border-r border-element-light-lighter-400 grow">
        <p className="text-sm text-text-500 font-medium max-w-full truncate">
          {getTime(startTime)}-{getTime(stopTime)}
          {isWeekdays() && weekDays.length < 7 ? ' - Running every weekday' : ''}
          {weekDays.length === 7 && ' - Running everyday'}
          {!isWeekdays() && weekDays.length !== 7 ? ' - ' + weekDays.join(', ') : ''}
        </p>
      </div>
      <div className="px-3 py-2 flex items-center">
        <div className="flex border border-element-light-lighter-500 rounded">
          <span className="w-7 h-7 flex items-center justify-center border-r border-element-light-lighter-500 text-text-400 text-xs cursor-pointer hover:bg-brand-50 hover:text-brand-500 transition">
            <Icon name="icon-solid-grip-lines" />
          </span>
          <Menu
            menus={menu}
            width={248}
            onOpen={(e) => setMenuOpen(e)}
            trigger={
              <span
                className={`w-7 h-7 flex items-center justify-center text-text-400 text-xs cursor-pointer hover:bg-brand-50 hover:text-brand-500 transition ${
                  menuOpen ? 'bg-brand-50 !text-brand-500' : ''
                }`}
              >
                <Icon name="icon-solid-ellipsis-v" />
              </span>
            }
          />
        </div>
      </div>
    </div>
  )
}

export default DeploymentRuleItem
