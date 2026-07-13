import {
  type BlueprintManifestContextVariableField,
  type BlueprintManifestResponseResultsInner,
  type BlueprintManifestVariableField,
} from 'qovery-typescript-axios'
import { getDefaultBlueprintFieldValues } from './blueprint-field-utils'

function createVariableField(overrides: Partial<BlueprintManifestVariableField> = {}): BlueprintManifestVariableField {
  return {
    kind: 'variable',
    name: 'field',
    required: true,
    is_secret: false,
    description: 'Field',
    type: { type: 'string' },
    ...overrides,
  } as BlueprintManifestVariableField
}

function createContextVariableField(
  overrides: Partial<BlueprintManifestContextVariableField> = {}
): BlueprintManifestContextVariableField {
  return {
    kind: 'contextVariable',
    name: 'context_field',
    description: 'Context field',
    source: 'environment',
    value: 'context-value',
    ...overrides,
  } as BlueprintManifestContextVariableField
}

describe('getDefaultBlueprintFieldValues', () => {
  it('returns defaults for required, optional, and overridable context fields', () => {
    const fields: BlueprintManifestResponseResultsInner[] = [
      createVariableField({ name: 'required_string', required: true, default_value: 'required-value' }),
      createVariableField({ name: 'optional_string', required: false, default_value: 'optional-value' }),
      {
        ...createVariableField({
          name: 'required_bool',
          required: true,
          type: { type: 'bool' },
          default_value: 'true',
        }),
      },
      {
        ...createContextVariableField({ name: 'overridable_context', value: 'context-value' }),
        overridable: true,
      },
    ] as BlueprintManifestResponseResultsInner[]

    expect(getDefaultBlueprintFieldValues(fields)).toEqual({
      required_string: 'required-value',
      optional_string: 'optional-value',
      required_bool: true,
      overridable_context: 'context-value',
    })
  })

  it('excludes non-overridable context fields and preserves empty values for missing defaults', () => {
    const fields: BlueprintManifestResponseResultsInner[] = [
      createVariableField({ name: 'required_without_default', required: true }),
      createVariableField({ name: 'optional_without_default', required: false }),
      createContextVariableField({ name: 'context_without_override', value: 'ignored' }),
      {
        ...createContextVariableField({ name: 'overridable_without_value', value: undefined }),
        overridable: true,
      },
    ] as BlueprintManifestResponseResultsInner[]

    expect(getDefaultBlueprintFieldValues(fields)).toEqual({
      required_without_default: '',
      optional_without_default: '',
      overridable_without_value: '',
    })
  })
})
