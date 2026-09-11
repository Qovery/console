import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CatalogVariableInput, type CatalogVariableInputProps } from './catalog-variable-input'

const defaultProps: CatalogVariableInputProps = {
  field: {
    key: 'retention',
    label: 'Retention',
    type: 'number',
    description: 'Retention period in weeks.',
  },
  onChange: jest.fn(),
  value: '12',
}

describe('CatalogVariableInput', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders a number field with its description and validation error', () => {
    renderWithProviders(<CatalogVariableInput {...defaultProps} error="Retention is invalid." />)

    expect(screen.getByRole('spinbutton', { name: 'Retention' })).toHaveValue(12)
    expect(screen.getByText('Retention is invalid.')).toBeInTheDocument()
    expect(screen.queryByText('Retention period in weeks.')).not.toBeInTheDocument()
  })

  it('renders sensitive values as passwords', () => {
    renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        field={{ key: 'token', label: 'Token', type: 'string', sensitive: true }}
        value="secret"
      />
    )

    expect(screen.getByLabelText('Token')).toHaveAttribute('type', 'password')
  })

  it('keeps the toggle presentation as the default for boolean fields', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        field={{ key: 'enabled', label: 'Enabled', type: 'bool', description: 'Enable this option.' }}
        value={false}
        onChange={onChange}
      />
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Enabled' }))

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByText('Enable this option.')).toBeInTheDocument()
  })

  it('renders a boolean control even when the field declares allowed values', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        field={{ key: 'enabled', label: 'Enabled', type: 'bool', allowedValues: ['true', 'false'] }}
        value={true}
        onChange={onChange}
      />
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Enabled' }))

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('supports a checkbox presentation for boolean fields', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        booleanControl="checkbox"
        field={{ key: 'enabled', label: 'Enabled', type: 'bool', description: 'Enable this option.' }}
        value={false}
        onChange={onChange}
      />
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'Enabled' }))

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByText('Enable this option.')).toBeInTheDocument()
  })
})
