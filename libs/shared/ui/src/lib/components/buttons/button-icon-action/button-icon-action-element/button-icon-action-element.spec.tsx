import { Icon } from '@console/shared/ui'
import { screen, render, fireEvent } from '__tests__/utils/setup-jest'
import ButtonIconActionElement, { ButtonIconActionElementProps } from './button-icon-action-element'

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
    const element = screen.queryByTestId('element')

    expect(element?.querySelector('svg')?.classList.contains('icon-solid-ellipsis-v'))
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
