import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'
import StatusMenu, { StatusMenuProps, StatusMenuState } from './status-menu'
import { ClickEvent } from '@szhsin/react-menu'
import Icon from '../icon/icon'

let props: StatusMenuProps

const clickAction = (e: ClickEvent, status: string) => {
  console.log(e)
}

beforeEach(() => {
  props = {
    status: StatusMenuState.RUNNING,
    menus: [
      {
        items: [
          {
            name: 'Deploy',
            onClick: (e: ClickEvent) => clickAction(e, 'Deploy'),
            contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
          },
          {
            name: 'Stop',
            onClick: (e: ClickEvent) => clickAction(e, 'Stop'),
            contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
          },
        ],
      },
      {
        items: [
          {
            name: 'Redeploy',
            onClick: (e: ClickEvent) => clickAction(e, 'Redeploy'),
            contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
          },
          {
            name: 'Update applications',
            onClick: (e: ClickEvent) => clickAction(e, 'Update'),
            contentLeft: <Icon name="icon-solid-rotate" className="text-sm text-brand-400" />,
          },
          {
            name: 'Rollback',
            onClick: (e: ClickEvent) => clickAction(e, 'Rollblack'),
            contentLeft: <Icon name="icon-solid-clock-rotate-left" className="text-sm text-brand-400" />,
          },
        ],
      },
    ],
  }
})

describe('StatusMenu', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StatusMenu {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have accurate status', () => {
    props.status = StatusMenuState.ERROR
    render(<StatusMenu {...props} />)
    const statusMenu = screen.getByTestId('statusmenu')
    expect(statusMenu.classList.contains('bg-error-50')).toBeTruthy()
  })
})
