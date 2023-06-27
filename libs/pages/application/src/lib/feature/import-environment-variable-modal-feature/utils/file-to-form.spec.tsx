import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { jsonToForm } from './file-to-form'

const jsonFile = {
  key1: 'value1',
  key2: 'value2',
  key3: 'value3',
  keyEmpty: '',
}

describe('fileToForm Function', () => {
  it('should return a defaultValues object from json', () => {
    expect(jsonToForm(JSON.stringify(jsonFile))).toEqual({
      key1_key: 'key1',
      key1_value: 'value1',
      key1_scope: APIVariableScopeEnum.ENVIRONMENT,
      key1_secret: '',
      key2_key: 'key2',
      key2_value: 'value2',
      key2_scope: APIVariableScopeEnum.ENVIRONMENT,
      key2_secret: '',
      key3_key: 'key3',
      key3_value: 'value3',
      key3_scope: APIVariableScopeEnum.ENVIRONMENT,
      key3_secret: '',
      keyEmpty_key: 'keyEmpty',
      keyEmpty_value: '',
      keyEmpty_scope: APIVariableScopeEnum.ENVIRONMENT,
      keyEmpty_secret: '',
    })
  })
})
