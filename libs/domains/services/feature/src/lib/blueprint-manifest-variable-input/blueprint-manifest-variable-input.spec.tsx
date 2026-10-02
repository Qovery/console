import { type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintManifestVariableInput } from './blueprint-manifest-variable-input'

const replicas: BlueprintManifestVariableField = {
  kind: 'variable',
  name: 'replica_count',
  type: { type: 'number', min: 1, max: 5 },
  required: true,
  is_secret: false,
  default_value: '2',
}

describe('BlueprintManifestVariableInput', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('keeps Blueprint variables editable and bound to the form value', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <BlueprintManifestVariableInput field={replicas} value="3" onChange={onChange} />
    )
    const input = screen.getByRole('spinbutton', { name: 'Replica count' })
    expect(input).toBeEnabled()
    expect(input).toHaveValue(3)
    await userEvent.type(input, '4')
    expect(onChange).toHaveBeenLastCalledWith('34')
  })

  it('keeps the toggle for Blueprint booleans', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <BlueprintManifestVariableInput
        field={{ ...replicas, name: 'enable_cache', type: { type: 'bool' }, default_value: 'false' }}
        value={false}
        onChange={onChange}
      />
    )
    await userEvent.click(screen.getByRole('switch', { name: 'Enable cache' }))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
