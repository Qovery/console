import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type OverridableBlueprintManifestContextVariableField } from '../../../../../blueprint-field-utils/blueprint-field-utils'
import {
  BlueprintOverridableFieldInput,
  type BlueprintOverridableFieldInputProps,
} from './blueprint-overridable-field-input'

// Mock the variable dropdown so the test does not depend on the variables API.
// The mock renders the trigger passed as children plus a helper button that
// simulates selecting a variable named `MY_VARIABLE`.
jest.mock('@qovery/domains/variables/feature', () => ({
  DropdownVariable: ({ children, onChange }: { children: ReactNode; onChange: (value: string) => void }) => (
    <div data-testid="dropdown-variable">
      {children}
      <button type="button" onClick={() => onChange('MY_VARIABLE')}>
        select-variable
      </button>
    </div>
  ),
}))

const field = {
  kind: 'contextVariable',
  name: 'database_url',
  source: 'environment',
  overridable: true,
} as unknown as OverridableBlueprintManifestContextVariableField

function renderInput(props: Partial<BlueprintOverridableFieldInputProps> = {}) {
  const defaultProps: BlueprintOverridableFieldInputProps = {
    field,
    environmentId: 'env-1',
    value: '',
    onChange: jest.fn(),
  }

  return renderWithProviders(<BlueprintOverridableFieldInput {...defaultProps} {...props} />)
}

describe('BlueprintOverridableFieldInput', () => {
  it('should render the formatted label, value and the magic wand trigger', () => {
    renderInput({ value: 'postgres://db' })

    expect(screen.getByRole('textbox', { name: 'Database url' })).toHaveValue('postgres://db')
    expect(screen.getByRole('button', { name: 'Insert variable' })).toBeInTheDocument()
  })

  it('should propagate manual input changes', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderInput({ onChange })

    await userEvent.type(screen.getByRole('textbox', { name: 'Database url' }), 'a')

    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('should insert the selected variable as an interpolation', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderInput({ value: '', onChange })

    await userEvent.click(screen.getByRole('button', { name: 'select-variable' }))

    expect(onChange).toHaveBeenCalledWith('{{MY_VARIABLE}}')
  })
})
