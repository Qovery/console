import { render, screen } from '__tests__/utils/setup-jest'
import selectEvent from 'react-select-event'
import { IconEnum } from '@qovery/shared/enums'
import Icon from '../../icon/icon'
import InputSelect, { InputSelectProps } from './input-select'

let props: InputSelectProps

beforeEach(() => {
  props = {
    label: 'Select Multiple',
    options: [
      { label: 'Test 1', value: 'test1', icon: <Icon name={IconEnum.GITLAB} className="w-4" /> },
      { label: 'Test 2', value: 'test2', icon: <Icon name={IconEnum.GITHUB} className="w-4" /> },
    ],
  }
})

describe('InputSelect', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSelect {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a label', () => {
    render(<InputSelect {...props} />)
    const label = screen.getByTestId('select').querySelector('label')
    expect(label).toBeTruthy()
  })

  it('should display an error', () => {
    props.error = 'Error'
    render(<InputSelect {...props} />)
    const select = screen.getByTestId('select')
    expect(select.classList.contains('input--error')).toBeTruthy()
  })

  it('should select second item in a single select', async () => {
    render(<InputSelect {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, 'Test 2')

    expect(screen.getByText('Test 2')).toBeInTheDocument()
  })

  it('should display the icon for the selected option on single only', async () => {
    render(<InputSelect {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, 'Test 2')

    screen.getByTestId('selected-icon')
  })

  it('should not display the icon for the selected option in a multi', async () => {
    render(<InputSelect {...props} isMulti />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, 'Test 2')

    expect(screen.queryByTestId('selected-icon')).not.toBeTruthy()
  })

  it('should select second item and first item in a multiple select', async () => {
    render(<InputSelect isMulti={true} {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, ['Test 2', 'Test 1'])

    screen.getByDisplayValue('test2,test1')
  })

  it('should be disabled', () => {
    props.disabled = true
    render(<InputSelect {...props} />)
    const select = screen.getByTestId('select')
    expect(select.classList.contains('!bg-neutral-100')).toBeTruthy()
  })

  it('should have a edit button when option is selected', async () => {
    const mockAction = jest.fn()

    props.options = [
      {
        label: 'Test 1',
        value: 'test1',
        icon: <Icon name={IconEnum.GITHUB} className="w-4" />,
        onClickEditable: mockAction,
      },
      {
        label: 'Test 2',
        value: 'test2',
        icon: <Icon name={IconEnum.GITLAB} className="w-4" />,
        onClickEditable: mockAction,
      },
    ]
    const { getByTestId } = render(<InputSelect {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, ['Test 2', 'Test 1'])

    const editIcon = getByTestId('selected-edit-icon')
    editIcon.click()

    expect(mockAction).toHaveBeenCalledTimes(1)
  })

  it('should have a button on the menu list with action', async () => {
    props.menuListButton = {
      label: 'New element',
      onClick: jest.fn(),
    }
    const { getByTestId } = render(<InputSelect {...props} />)

    const realSelect = screen.getByLabelText('Select Multiple')
    selectEvent.openMenu(realSelect)

    const input = getByTestId('input-menu-list-button')
    input.click()

    expect(props.menuListButton.onClick).toHaveBeenCalledTimes(1)
  })

  it('renders InputSelect component when isFilter is true', async () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ]
    const onChangeMock = jest.fn()

    render(<InputSelect placeholder="Filter" isFilter={true} options={options} onChange={onChangeMock} />)
    const realSelect = screen.getByText('Filter')

    await selectEvent.select(realSelect, 'Option 2')

    expect(onChangeMock).toHaveBeenCalledWith('option2')
    expect(screen.getByTestId('select')).toHaveClass('input--filter')
  })
})
