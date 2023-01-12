import { screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import Icon from '../../icon/icon'
import ButtonAction, { ButtonActionProps } from './button-action'

let props: ButtonActionProps

beforeEach(() => {
  props = {
    menus: [
      {
        items: [
          {
            name: 'Deploy',
            onClick: (e) => console.log(e, 'Deploy'),
            contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
          },
          {
            name: 'Stop',
            onClick: (e) => console.log(e, 'Stop'),
            contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
          },
        ],
      },
    ],
    children: 'Button',
  }
})

describe('ButtonAction', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonAction {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an accurate classname', () => {
    props.className = 'some-class-name'
    render(<ButtonAction {...props} />)
    const button = screen.getByTestId('button-action')
    expect(button.classList.contains('some-class-name')).toBeTruthy()
  })
})
