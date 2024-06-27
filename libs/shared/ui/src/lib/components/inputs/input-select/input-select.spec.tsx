import selectEvent from 'react-select-event'
import { IconEnum } from '@qovery/shared/enums'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Icon from '../../icon/icon'
import InputSelect, { type InputSelectProps } from './input-select'

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
    const { baseElement } = renderWithProviders(<InputSelect {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a label', () => {
    renderWithProviders(<InputSelect {...props} />)
    const label = screen.getByTestId('select').querySelector('label')
    expect(label).toBeTruthy()
  })

  it('should display an error', () => {
    props.error = 'Error'
    renderWithProviders(<InputSelect {...props} />)
    const select = screen.getByTestId('select')
    expect(select).toHaveClass('input--error')
  })

  it('should select second item in a single select', async () => {
    renderWithProviders(<InputSelect {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, 'Test 2')

    expect(screen.getByText('Test 2')).toBeInTheDocument()
  })

  it('should display the icon for the selected option on single only', async () => {
    renderWithProviders(<InputSelect {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, 'Test 2')

    screen.getByTestId('selected-icon')
  })

  it('should not display the icon for the selected option in a multi', async () => {
    renderWithProviders(<InputSelect {...props} isMulti />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, 'Test 2')

    expect(screen.queryByTestId('selected-icon')).not.toBeInTheDocument()
  })

  it('should select second item and first item in a multiple select', async () => {
    renderWithProviders(<InputSelect isMulti={true} {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, ['Test 2', 'Test 1'])

    screen.getByDisplayValue('test2,test1')
  })

  it('should be disabled', () => {
    props.disabled = true
    renderWithProviders(<InputSelect {...props} />)
    const select = screen.getByTestId('select')
    expect(select).toHaveClass('!bg-neutral-100')
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
    const { userEvent } = renderWithProviders(<InputSelect {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await selectEvent.select(realSelect, ['Test 2', 'Test 1'])

    const editIcon = screen.getByTestId('selected-edit-icon')
    await userEvent.click(editIcon)

    expect(mockAction).toHaveBeenCalledTimes(1)
  })

  it('should have a button on the menu list with action', async () => {
    props.menuListButton = {
      label: 'New element',
      onClick: jest.fn(),
    }
    renderWithProviders(<InputSelect {...props} />)

    const realSelect = screen.getByLabelText('Select Multiple')
    selectEvent.openMenu(realSelect)

    const input = screen.getByTestId('input-menu-list-button')
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

    renderWithProviders(<InputSelect placeholder="Filter" isFilter={true} options={options} onChange={onChangeMock} />)
    const realSelect = screen.getByText('Filter')

    await selectEvent.select(realSelect, 'Option 2')

    expect(onChangeMock).toHaveBeenCalledWith('option2')
    expect(screen.getByTestId('select')).toHaveClass('input--filter')
  })
})
