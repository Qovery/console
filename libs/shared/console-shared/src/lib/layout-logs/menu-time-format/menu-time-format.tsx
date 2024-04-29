import { Button, Icon, IconAwesomeEnum, Menu, MenuAlign, type MenuData } from '@qovery/shared/ui'

export interface MenuTimeFormatProps {
  updateTimeContextValue: { utc: boolean }
  setUpdateTimeContext: (value: { utc: boolean }) => void
}

export function MenuTimeFormat(props: MenuTimeFormatProps) {
  const { updateTimeContextValue, setUpdateTimeContext } = props

  const menusTimeFormat: MenuData = [
    {
      title: 'Time format',
      items: [
        {
          name: 'Local browser time',
          contentLeft: (
            <Icon
              name={IconAwesomeEnum.CHECK}
              className={`text-green-500 ${!updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
            />
          ),
          onClick: () => setUpdateTimeContext({ utc: false }),
        },
        {
          name: 'UTC',
          contentLeft: (
            <Icon
              name={IconAwesomeEnum.CHECK}
              className={`text-green-500 ${updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
            />
          ),
          onClick: () => setUpdateTimeContext({ utc: true }),
        },
      ],
    },
  ]

  return (
    <Menu
      menus={menusTimeFormat}
      arrowAlign={MenuAlign.END}
      trigger={
        <Button className="mr-2 gap-2" type="button" color="neutral">
          Time format
          <Icon iconName="angle-down" className="ml-2" />
        </Button>
      }
    />
  )
}

export default MenuTimeFormat
