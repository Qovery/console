import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import Icon from '../../../icon/icon'
import ButtonIconActionElement, { type ButtonIconActionElementProps } from './button-icon-action-element'

describe('ButtonIconActionElement', () => {
  let props: ButtonIconActionElementProps

  beforeEach(() => {
    props = {
      iconLeft: <Icon name="icon-solid-ellipsis-v" />,
    }
  })
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonIconActionElement {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an icon', () => {
    render(<ButtonIconActionElement {...props} />)
    const element = screen.queryByTestId('element')

    expect(element?.querySelector('span')?.classList).toContain('icon-solid-ellipsis-v')
  })

  it('should have a click emitted', () => {
    const onClick = jest.fn()

    props.onClick = onClick

    render(<ButtonIconActionElement {...props} />)

    const element = screen.queryByTestId('element') as HTMLDivElement

    fireEvent.click(element)

    expect(onClick.mock.calls.length).toEqual(1)
  })
})
