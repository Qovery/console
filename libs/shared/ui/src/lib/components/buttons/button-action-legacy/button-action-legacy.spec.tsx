import { render, screen } from '__tests__/utils/setup-jest'
import Icon from '../../icon/icon'
import ButtonActionLegacy, { type ButtonActionLegacyProps } from './button-action-legacy'

let props: ButtonActionLegacyProps

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
  }
})

describe('ButtonActionLegacy', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonActionLegacy {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an accurate classname', () => {
    props.className = 'some-class-name'
    render(<ButtonActionLegacy {...props} />)
    const button = screen.getByTestId('button-action')
    expect(button.classList.contains('some-class-name')).toBeTruthy()
  })
})
