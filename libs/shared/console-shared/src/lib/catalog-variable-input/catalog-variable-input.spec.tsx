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

  it('renders row layout with its description beside the control', () => {
    renderWithProviders(<CatalogVariableInput {...defaultProps} layout="row" />)

    expect(screen.getByRole('spinbutton', { name: 'Retention' })).toHaveValue(12)
    expect(screen.getByText('Retention period in weeks.')).toBeInTheDocument()
    expect(screen.getByText('Retention period in weeks.')).not.toHaveAttribute('data-state')
  })

  it('clamps long row descriptions and exposes their full content in a tooltip', async () => {
    const description =
      "CPU/memory budget applied to the active Loki workloads. CHART_DEFAULT keeps the chart's own behavior, while presets apply Qovery's versioned budgets. Budgets are not capacity guarantees. Every resource field may be changed at any time; an update recompiles the Helm values and rolls the workloads. Preset budgets apply versioned resource values."

    const { userEvent } = renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        field={{ key: 'resource-profile', label: 'Resource profile', type: 'string', description }}
        layout="row"
      />
    )

    const descriptionElement = screen.getByTestId('truncate-text')
    expect(descriptionElement.parentElement).toHaveClass('line-clamp-3')
    expect(descriptionElement).toHaveTextContent(/CPU\/memory budget applied/)
    expect(descriptionElement.innerHTML).toContain('\n')

    await userEvent.hover(descriptionElement)

    expect(await screen.findByRole('tooltip')).toHaveTextContent(description)
  })

  it('keeps a boolean control aligned to the right when showing an error', () => {
    const error = 'Loki high availability requires object storage.'

    renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        error={error}
        field={{ key: 'high-availability', label: 'High availability', type: 'bool' }}
        layout="row"
        value={false}
      />
    )

    expect(screen.getByRole('switch', { name: 'High availability' })).toBeInTheDocument()
    expect(screen.getByText(error)).toBeInTheDocument()
    expect(screen.getByTestId('input-toggle').parentElement).toHaveClass('items-end')
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
