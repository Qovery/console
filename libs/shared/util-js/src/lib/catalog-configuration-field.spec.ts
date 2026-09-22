import { type FieldSchemaResponse } from 'qovery-typescript-axios'
import { applyCatalogConfigurationDefaults, omitEmptyCatalogValues } from './catalog-configuration-field'

const number: FieldSchemaResponse = {
  key: 'size',
  label: 'Size',
  type: 'number',
  required: false,
  sensitive: false,
  defaultValue: '3',
  constraints: {},
}
const fields: FieldSchemaResponse[] = [
  {
    key: 'pools',
    label: 'Pools',
    type: 'array',
    required: true,
    sensitive: false,
    constraints: { uniqueItems: false },
    items: { type: 'object', fields: [number] },
  },
]

describe('structured catalog values', () => {
  it('preserves valueless taints while omitting cleared selectors and invalid blank keys', () => {
    const fields: FieldSchemaResponse[] = [
      { key: 'selector', type: 'string', label: 'Selector', required: false, sensitive: false, constraints: {} },
      {
        key: 'tolerations',
        type: 'array',
        label: 'Tolerations',
        required: false,
        sensitive: false,
        constraints: { uniqueItems: false },
        items: {
          type: 'object',
          fields: [
            {
              key: 'key',
              type: 'string',
              label: 'Key',
              required: true,
              sensitive: false,
              constraints: { minLength: 1 },
            },
            {
              key: 'value',
              type: 'string',
              label: 'Value',
              required: true,
              sensitive: false,
              constraints: { pattern: '[a-z]*' },
            },
            {
              key: 'effect',
              type: 'string',
              label: 'Effect',
              required: true,
              sensitive: false,
              constraints: { allowedValues: ['NoSchedule'] },
            },
          ],
        },
      },
    ]
    expect(omitEmptyCatalogValues({ selector: '', tolerations: [{ key: '', value: '', effect: '' }] }, fields)).toEqual(
      { tolerations: [{ value: '' }] }
    )
  })
  it('applies defaults within rows without resurrecting an explicitly cleared value', () => {
    expect(applyCatalogConfigurationDefaults(fields, { pools: [{}, { size: '' }, { size: 7 }] })).toEqual({
      pools: [{ size: 3 }, { size: '' }, { size: 7 }],
    })
  })
  it('uses contextual row defaults', () => {
    expect(
      applyCatalogConfigurationDefaults(
        [
          {
            ...fields[0],
            type: 'array',
            constraints: { uniqueItems: false },
            items: { type: 'object', fields: [number] },
            itemFields: [[{ ...number, defaultValue: '8' }]],
          },
        ],
        { pools: [{}] }
      )
    ).toEqual({ pools: [{ size: 8 }] })
  })
  it('cleans nested empty properties but retains array indices for validation', () => {
    expect(
      omitEmptyCatalogValues({
        pools: [{ name: '', size: 0, spot: false }, {}],
        types: ['', 'm5.large'],
        empty: undefined,
      })
    ).toEqual({ pools: [{ size: 0, spot: false }, {}], types: ['', 'm5.large'] })
  })
})
