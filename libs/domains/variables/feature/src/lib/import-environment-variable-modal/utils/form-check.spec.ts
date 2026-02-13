import { APIVariableScopeEnum, APIVariableTypeEnum } from 'qovery-typescript-axios'
import { validateKey, warningMessage } from './form-check'

const mockedExistingEnvVar = [
  {
    id: '30cac27f-52ca-4765-8e3c-a5f7717bc367',
    created_at: '2022-07-28T15:04:33.511216Z',
    updated_at: '2022-07-28T15:04:33.511218Z',
    key: 'variable',
    value: 'lkj',
    scope: APIVariableScopeEnum.PROJECT,
    service_name: '',
  },
  {
    id: '684bf2e9-ceda-481b-8b4f-1620711f50ca',
    created_at: '2022-07-28T15:49:32.27777Z',
    updated_at: '2022-08-01T13:42:04.879342Z',
    key: 'database_accesss',
    value: 'lkjdsf',
    scope: APIVariableScopeEnum.ENVIRONMENT,
    service_name: '',
  },
  {
    id: '48903a30-f661-4f78-85ad-9a4435428ea6',
    created_at: '2022-07-21T10:50:40.339856Z',
    updated_at: '2022-08-01T15:37:08.400236Z',
    key: 'public_aliasdd',
    value: 'public_4asdfasdf',
    scope: APIVariableScopeEnum.ENVIRONMENT,
    aliased_variable: {
      id: '48903a30-f661-4f78-85ad-9a4435428ea6',
      key: 'public_4asdfasdf',
      value: 'Coming Soon',
      scope: APIVariableScopeEnum.ENVIRONMENT,
      mount_path: '',
      variable_type: APIVariableTypeEnum.ALIAS,
    },
    service_name: '',
  },
  {
    id: '7bf87f4c-d040-4061-a854-1da9a2683cfa',
    created_at: '2022-07-28T15:05:09.392152Z',
    updated_at: '2022-07-28T15:05:09.392153Z',
    key: 'variable_denv',
    value: 'hey',
    scope: APIVariableScopeEnum.PROJECT,
    service_name: '',
  },
  {
    id: '7c91be9d-d583-4341-813b-9dd6014571e6',
    created_at: '2022-08-02T09:13:19.108507Z',
    updated_at: '2022-08-02T09:13:19.108508Z',
    key: 'variable_1',
    value: 'hello',
    scope: APIVariableScopeEnum.PROJECT,
    service_name: '',
  },
  {
    id: '2c5a25a6-a009-4d1d-826c-0a3763e55a16',
    created_at: '2022-07-28T15:49:32.276928Z',
    updated_at: '2022-07-28T15:49:32.276929Z',
    key: 'variable_2',
    value: 'melvin',
    scope: APIVariableScopeEnum.ENVIRONMENT,
    service_name: '',
  },
  {
    id: 'b1378a36-331a-4ed0-95dc-fd8c28dc16f6',
    created_at: '2022-07-28T15:49:32.278581Z',
    updated_at: '2022-07-28T15:49:32.278581Z',
    key: 'variable_3',
    value: '098098',
    scope: APIVariableScopeEnum.ENVIRONMENT,
    service_name: '',
  },
  {
    id: 'a89dab02-5dae-4c7f-a9ff-b278944c8f0b',
    created_at: '2022-08-02T14:15:48.864561Z',
    updated_at: '2022-08-02T14:15:48.864561Z',
    key: 'variable_2',
    value: 'hey',
    scope: APIVariableScopeEnum.APPLICATION,
    overridden_variable: {
      id: '2c5a25a6-a009-4d1d-826c-0a3763e55a16',
      key: 'variable_2',
      value: 'melvin',
      scope: APIVariableScopeEnum.ENVIRONMENT,
      mount_path: '',
      variable_type: APIVariableTypeEnum.OVERRIDE,
    },
    service_name: '',
  },
]

describe('validateKey', () => {
  it('should return a string if value begins with QOVERY', () => {
    expect(validateKey('QOVERY_variable', [], APIVariableScopeEnum.ENVIRONMENT)).toEqual(
      `Variable name cannot begin with "QOVERY"`
    )
  })

  it('should return a string variable key already exists on a lower scope', () => {
    expect(validateKey('variable_2', mockedExistingEnvVar, APIVariableScopeEnum.PROJECT)).toEqual(
      'This variable name already exists on a lower scope'
    )
  })

  it('should return true if nothing is wrong', () => {
    expect(validateKey('variable_4', mockedExistingEnvVar, APIVariableScopeEnum.ENVIRONMENT)).toEqual(true)
  })
})

describe('warningMessage', () => {
  it('should say that an override is gonna be created', () => {
    expect(warningMessage('variable_2', mockedExistingEnvVar, APIVariableScopeEnum.APPLICATION)).toEqual(
      'This variable name already exists on a higher scope. An override will be created.'
    )
  })

  describe('with overwrite on', () => {
    it('should say that an override is gonna be updated', () => {
      expect(warningMessage('variable_2', mockedExistingEnvVar, APIVariableScopeEnum.ENVIRONMENT, true)).toEqual(
        'This variable name on the same scope already exists and will be updated'
      )
    })
  })

  describe('with overwrite off', () => {
    it('should say that the value already exist on this scope and will not be updated', () => {
      expect(warningMessage('variable_2', mockedExistingEnvVar, APIVariableScopeEnum.ENVIRONMENT, false)).toEqual(
        'This variable already exists and will not be updated'
      )
    })
  })
})
