import { type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintManifestVariableInput } from './blueprint-manifest-variable-input'

const mockUseParams = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => mockUseParams(),
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  ...jest.requireActual('@qovery/domains/variables/feature'),
  DropdownVariable: ({
    children,
    environmentId,
    onChange,
  }: {
    children: React.ReactNode
    environmentId: string
    onChange: (value: string) => void
  }) => (
    <div data-testid="dropdown-variable" data-environment-id={environmentId} onClick={() => onChange('RABBIT_PW')}>
      {children}
    </div>
  ),
}))

function createVariableField(overrides: Partial<BlueprintManifestVariableField> = {}): BlueprintManifestVariableField {
  return {
    kind: 'variable',
    name: 'instance_class',
    required: true,
    is_secret: false,
    description: 'RDS instance class',
    type: { type: 'string' },
    ...overrides,
  } as BlueprintManifestVariableField
}

const SHORT_ALLOWED_VALUES = [
  'db.t3.micro',
  'db.t3.small',
  'db.t3.medium',
  'db.t3.large',
  'db.t4g.micro',
  'db.t4g.small',
  'db.m5.large',
  'db.m5.xlarge',
  'db.m8g.large',
  'db.m8g.xlarge',
]
const LONG_ALLOWED_VALUES = [...SHORT_ALLOWED_VALUES, 'db.r5.large']

describe('BlueprintManifestVariableInput', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ environmentId: 'env-1' })
  })

  describe('with more than 10 allowed values', () => {
    const field = createVariableField({ allowed_values: LONG_ALLOWED_VALUES })

    it('filters the allowed values as the user types', async () => {
      const { userEvent } = renderWithProviders(
        <BlueprintManifestVariableInput field={field} value={undefined} onChange={jest.fn()} />
      )

      await userEvent.type(screen.getByLabelText('Instance class'), 'm8g')

      expect(screen.getByText('db.m8g.large')).toBeInTheDocument()
      expect(screen.getByText('db.m8g.xlarge')).toBeInTheDocument()
      expect(screen.queryByText('db.t3.micro')).not.toBeInTheDocument()
    })

    it('selects a searched value', async () => {
      const onChange = jest.fn()
      const { userEvent } = renderWithProviders(
        <BlueprintManifestVariableInput field={field} value={undefined} onChange={onChange} />
      )

      await userEvent.type(screen.getByLabelText('Instance class'), 'm8g.x')
      await userEvent.click(screen.getByText('db.m8g.xlarge'))

      expect(onChange).toHaveBeenCalledWith('db.m8g.xlarge')
    })

    it('does not let the user create a value outside the allowed values', async () => {
      const onChange = jest.fn()
      const { userEvent } = renderWithProviders(
        <BlueprintManifestVariableInput field={field} value={undefined} onChange={onChange} />
      )

      await userEvent.type(screen.getByLabelText('Instance class'), 'db.custom.large{Enter}')

      expect(screen.getByText('No result for this search')).toBeInTheDocument()
      expect(screen.queryByText('Select "db.custom.large"')).not.toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('with 10 allowed values or fewer', () => {
    const field = createVariableField({ allowed_values: SHORT_ALLOWED_VALUES })

    it('renders a plain dropdown that ignores typing', async () => {
      const { userEvent } = renderWithProviders(
        <BlueprintManifestVariableInput field={field} value={undefined} onChange={jest.fn()} />
      )

      await userEvent.click(screen.getByLabelText('Instance class'))
      await userEvent.keyboard('m8g')

      expect(screen.getByText('db.t3.micro')).toBeInTheDocument()
      expect(screen.getByText('db.m8g.large')).toBeInTheDocument()
    })

    it('still selects a value from the list', async () => {
      const onChange = jest.fn()
      const { userEvent } = renderWithProviders(
        <BlueprintManifestVariableInput field={field} value={undefined} onChange={onChange} />
      )

      await userEvent.click(screen.getByLabelText('Instance class'))
      await userEvent.click(screen.getByText('db.m5.large'))

      expect(onChange).toHaveBeenCalledWith('db.m5.large')
    })
  })

  describe('variable picker', () => {
    const secretField = createVariableField({ name: 'admin_password', is_secret: true, description: undefined })

    it('is shown on secret fields when an environment is known', () => {
      renderWithProviders(<BlueprintManifestVariableInput field={secretField} value={undefined} onChange={jest.fn()} />)

      expect(screen.getByRole('button', { name: 'Reference a variable' })).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-variable')).toHaveAttribute('data-environment-id', 'env-1')
    })

    it('is hidden on non-secret fields', () => {
      renderWithProviders(
        <BlueprintManifestVariableInput field={createVariableField()} value={undefined} onChange={jest.fn()} />
      )

      expect(screen.queryByRole('button', { name: 'Reference a variable' })).not.toBeInTheDocument()
    })

    it('is hidden without an environment', () => {
      mockUseParams.mockReturnValue({})
      renderWithProviders(<BlueprintManifestVariableInput field={secretField} value={undefined} onChange={jest.fn()} />)

      expect(screen.queryByRole('button', { name: 'Reference a variable' })).not.toBeInTheDocument()
    })

    it('sets the picked variable as a reference', async () => {
      const onChange = jest.fn()
      const { userEvent } = renderWithProviders(
        <BlueprintManifestVariableInput field={secretField} value={undefined} onChange={onChange} />
      )

      await userEvent.click(screen.getByTestId('dropdown-variable'))

      expect(onChange).toHaveBeenCalledWith('{{RABBIT_PW}}')
    })
  })
})
