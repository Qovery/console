import { prepareVariableImportRequest } from './prepare-variable-import-request'

describe('prepareVariableImportRequest', () => {
  it('returns null when there are no variables', () => {
    expect(prepareVariableImportRequest([])).toBeNull()
  })

  it('formats variables for import and skips variables without scope', () => {
    expect(
      prepareVariableImportRequest([
        {
          variable: 'MY_VAR',
          value: 'value',
          scope: 'APPLICATION',
          isSecret: false,
        },
        {
          variable: 'SKIPPED_VAR',
          value: 'value',
          scope: undefined,
          isSecret: true,
        },
      ])
    ).toEqual({
      overwrite: true,
      vars: [
        {
          name: 'MY_VAR',
          value: 'value',
          scope: 'APPLICATION',
          is_secret: false,
        },
      ],
    })
  })
})
