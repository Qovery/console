import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'
import StatusMenu, { StatusMenuProps } from './status-menu'
import { ClickEvent } from '@szhsin/react-menu'
import { StateEnum } from 'qovery-typescript-axios'

let props: StatusMenuProps

const clickAction = (e: ClickEvent, status: string) => {
  console.log(e)
}

beforeEach(() => {
  props = {
    statusActions: {
      status: StateEnum.RUNNING,
      actions: [
        {
          name: 'deploy',
          action: jest.fn(),
        },
      ],
      information: {
        id: '',
        name: '',
        mode: '',
      },
    },
  }
})

describe('StatusMenu', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StatusMenu {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have accurate status', () => {
    props.statusActions.status = StateEnum.DEPLOYMENT_ERROR
    render(<StatusMenu {...props} />)
    setTimeout(() => {
      const statusMenu = screen.getByTestId('statusmenu')
      expect(statusMenu.classList.contains('status-menu--warning')).toBeTruthy()
    }, 1000)
  })
})
