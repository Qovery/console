import { act, getByTestId, getByText, queryByText, render } from '__tests__/utils/setup-jest'
import EnableBox, { type EnableBoxProps } from './enable-box'

const props: EnableBoxProps = {
  checked: false,
  setChecked: jest.fn(),
  name: 'test',
  description: 'test',
  title: 'test',
  children: <div>children content</div>,
}

describe('EnableBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EnableBox {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should check the box if we click anywhere on the card when unchecked', async () => {
    const { baseElement } = render(<EnableBox {...props} />)
    const box = getByTestId(baseElement, 'enabled-box')
    await act(() => {
      box.click()
    })

    expect(props.setChecked).toHaveBeenCalledWith(true)
  })

  it('should not check the box if we click anywhere on the card when already checked', async () => {
    const { baseElement } = render(<EnableBox {...props} checked={true} />)
    const box = getByTestId(baseElement, 'enabled-box')
    await act(jest.fn())

    await act(() => {
      box.click()
    })

    expect(props.setChecked).not.toHaveBeenCalledWith(false)
  })

  it('should uncheck when you click on the checkbox', async () => {
    const { baseElement } = render(<EnableBox {...props} checked={true} />)
    const box = getByTestId(baseElement, 'enabled-box')
    const checkbox = getByTestId(box, 'input-checkbox')

    await act(() => {
      checkbox.click()
    })

    expect(props.setChecked).toHaveBeenCalledWith(false)
  })

  it('should display children only when checked', async () => {
    const { baseElement } = render(<EnableBox {...props} checked={false} />)
    const box = getByTestId(baseElement, 'enabled-box')

    const children = queryByText(baseElement, 'children content')

    expect(children).not.toBeInTheDocument()

    await act(() => {
      box.click()
    })

    getByText(baseElement, 'children content')
  })
})
