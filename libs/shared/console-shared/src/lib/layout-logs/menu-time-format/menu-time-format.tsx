import { Button, ButtonSize, ButtonStyle, Icon, IconAwesomeEnum, Menu, MenuAlign, MenuData } from '@qovery/shared/ui'

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
          name: 'Local browser timed',
          contentLeft: (
            <Icon
              name={IconAwesomeEnum.CHECK}
              className={`text-success-500 ${!updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
            />
          ),
          onClick: () => setUpdateTimeContext({ utc: false }),
        },
        {
          name: 'UTC',
          contentLeft: (
            <Icon
              name={IconAwesomeEnum.CHECK}
              className={`text-success-500 ${updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
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
        <Button className="mr-2" size={ButtonSize.TINY} style={ButtonStyle.DARK} iconRight={IconAwesomeEnum.ANGLE_DOWN}>
          Time format
        </Button>
      }
    />
  )
}

export default MenuTimeFormat
