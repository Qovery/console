import { type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintManifestVariableInput } from './blueprint-manifest-variable-input'

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
})
