import {
  buildBlueprintUpdatePayload,
  getBlueprintUpdateFieldValue,
  getBlueprintUpdatePayloadValue,
  getBlueprintUpdateVersion,
  getFirstAvailableUpdateSection,
  getRawOutputLineClassName,
  hasBlueprintUpdateReviewSections,
} from './blueprint-update-utils'
import { type BlueprintUpdateResponse } from 'qovery-typescript-axios'

function createBlueprintUpdate(overrides: Partial<BlueprintUpdateResponse> = {}): BlueprintUpdateResponse {
  return {
    is_up_to_date: false,
    latest_tag: 'AWS/postgres/17/1.2.5',
    new_required_values: [],
    new_optional_values: [],
    now_required_values: [],
    updated_values: [],
    removed_values: [],
    engine_diff: { updated_values: [] },
    ...overrides,
  }
}

describe('blueprint update utils', () => {
  it('extracts the version from a blueprint tag', () => {
    expect(getBlueprintUpdateVersion('AWS/postgres/17/1.2.5/')).toBe('1.2.5')
  })

  it('selects the first section that needs user attention', () => {
    expect(getFirstAvailableUpdateSection(createBlueprintUpdate({ new_required_values: [{ name: 'required', type: { type: 'string' }, is_secret: false }] }))).toBe('required')
    expect(getFirstAvailableUpdateSection(createBlueprintUpdate({ new_optional_values: [{ name: 'optional', default_value: 'value', type: { type: 'string' }, is_secret: false }] }))).toBe('optional')
    expect(getFirstAvailableUpdateSection(createBlueprintUpdate({ engine_diff: { updated_values: [{ name: 'engine', current_default_value: 'old', new_default_value: 'new' }] } }))).toBe('modified')
    expect(getFirstAvailableUpdateSection(createBlueprintUpdate({ removed_values: [{ name: 'removed' }] }))).toBe('removed')
  })

  it('reports whether the update contains review sections', () => {
    expect(hasBlueprintUpdateReviewSections(createBlueprintUpdate())).toBe(false)
    expect(hasBlueprintUpdateReviewSections(createBlueprintUpdate({ removed_values: [{ name: 'removed' }] }))).toBe(true)
  })

  it('normalizes field values for the update payload', () => {
    expect(getBlueprintUpdatePayloadValue('  value  ')).toBe('value')
    expect(getBlueprintUpdatePayloadValue(true)).toBe('true')
    expect(getBlueprintUpdatePayloadValue('   ')).toBeUndefined()
  })

  it('converts unrestricted boolean fields to boolean form values', () => {
    const field = { name: 'enabled', type: { type: 'bool' }, is_secret: false, allowed_values: null }

    expect(getBlueprintUpdateFieldValue(field, 'true')).toBe(true)
    expect(getBlueprintUpdateFieldValue(field, 'false')).toBe(false)
  })

  it('builds a patch with only changed variables', () => {
    const requiredValues = [{ name: 'required', type: { type: 'string' }, is_secret: true }]
    const optionalValues = [{ name: 'optional', default_value: 'default', type: { type: 'string' }, is_secret: false }]
    const updatedValues = [
      { name: 'changed', current_default_value: 'old', new_default_value: 'new', type: { type: 'string' }, is_secret: false },
      { name: 'engine_changed', current_default_value: 'old', new_default_value: 'new' },
    ]

    expect(
      buildBlueprintUpdatePayload({
        icon: 'icon',
        name: 'service',
        tag: 'AWS/postgres/17/1.2.5',
        requiredValues,
        optionalValues,
        updatedValues,
        values: {
          required: 'secret',
          optional: 'default',
          changed: 'override',
          engine_changed: 'engine-override',
        },
      })
    ).toEqual({
      icon: 'icon',
      name: 'service',
      tag: 'AWS/postgres/17/1.2.5',
      variables: {
        required: { value: 'secret', is_secret: true },
        changed: { value: 'override', is_secret: false },
        engine_changed: { value: 'engine-override' },
      },
    })
  })

  it('maps raw output prefixes to semantic colors', () => {
    expect(getRawOutputLineClassName('  + added')).toBe('text-positive')
    expect(getRawOutputLineClassName('  - removed')).toBe('text-negative')
    expect(getRawOutputLineClassName('  ~ changed')).toBe('text-info')
    expect(getRawOutputLineClassName(' unchanged')).toBeUndefined()
  })
})
