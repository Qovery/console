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

  it('renders a number field with its validation error in place of the description', () => {
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

  it('shows the whole row description while searching', () => {
    renderWithProviders(<CatalogVariableInput {...defaultProps} layout="row" highlight="weeks" />)

    const match = screen.getByText('weeks', { selector: 'mark' })
    expect(match.closest('p')).not.toHaveClass('line-clamp-3')
  })

  it('names the row checkbox after its field', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        booleanControl="checkbox"
        field={{ key: 'enabled', label: 'Enabled', type: 'bool' }}
        layout="row"
        value={false}
        onChange={onChange}
      />
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'Enabled' }))

    expect(onChange).toHaveBeenCalledWith(true)
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

  it.each([
    ['a toggle in the row layout', { type: 'bool' }, 'row', 'switch', undefined],
    ['a select in the row layout', { type: 'string', allowedValues: ['small', 'large'] }, 'row', 'combobox', undefined],
    ['a toggle in the card layout', { type: 'bool' }, 'card', 'switch', undefined],
    ['a checkbox in the card layout', { type: 'bool' }, 'card', 'checkbox', 'checkbox'],
  ] as const)('ties the error to %s', (_, fieldType, layout, role, booleanControl) => {
    renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        error="This value is not allowed."
        field={{ key: 'profile', label: 'Profile', ...fieldType }}
        layout={layout}
        booleanControl={booleanControl}
        value={fieldType.type === 'bool' ? false : 'small'}
      />
    )

    const control = screen.getByRole(role, { name: 'Profile' })
    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(control).toHaveAccessibleDescription('This value is not allowed.')
  })

  it('does not flag a control without error', () => {
    renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        field={{ key: 'high-availability', label: 'High availability', type: 'bool' }}
        layout="row"
        value={false}
      />
    )

    const control = screen.getByRole('switch', { name: 'High availability' })
    expect(control).not.toHaveAttribute('aria-invalid')
    expect(control).not.toHaveAttribute('aria-describedby')
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

  it.each(['card', 'row'] as const)('masks sensitive number values in the %s layout', (layout) => {
    renderWithProviders(
      <CatalogVariableInput
        {...defaultProps}
        field={{ key: 'pin', label: 'Pin', type: 'number', sensitive: true }}
        layout={layout}
        value="1234"
      />
    )

    expect(screen.getByLabelText('Pin')).toHaveAttribute('type', 'password')
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
