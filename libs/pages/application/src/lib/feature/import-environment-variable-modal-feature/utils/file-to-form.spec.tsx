import { jsonToForm } from './file-to-form'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'

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
      key1_scope: EnvironmentVariableScopeEnum.PROJECT,
      key1_secret: 'true',
      key2_key: 'key2',
      key2_value: 'value2',
      key2_scope: EnvironmentVariableScopeEnum.PROJECT,
      key2_secret: 'true',
      key3_key: 'key3',
      key3_value: 'value3',
      key3_scope: EnvironmentVariableScopeEnum.PROJECT,
      key3_secret: 'true',
      keyEmpty_key: 'keyEmpty',
      keyEmpty_value: '',
      keyEmpty_scope: EnvironmentVariableScopeEnum.PROJECT,
      keyEmpty_secret: 'true',
    })
  })
})
