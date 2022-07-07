import {
  CrudEnvironmentVariableModalFeatureProps,
  DataFormEnvironmentVariableInterface,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../crud-environment-variable-modal-feature'
import { mockEnvironmentVariable } from '@console/domains/environment-variable'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { handleSubmitForEnvSecretCreation } from './handle-submit'

const mockSetOpen = jest.fn()

describe('Handle Submit Environment Variable', () => {
  const props: CrudEnvironmentVariableModalFeatureProps = {
    variable: mockEnvironmentVariable(false, false),
    mode: EnvironmentVariableCrudMode.CREATION,
    type: EnvironmentVariableType.NORMAL,
    setOpen: mockSetOpen,
    applicationId: '123',
    environmentId: '456',
    projectId: '789',
  }

  const data: DataFormEnvironmentVariableInterface = {
    key: 'key',
    value: 'value',
    scope: EnvironmentVariableScopeEnum.PROJECT,
    isSecret: false,
  }

  let mockDispatch: () => void, mockSetLoading: () => void, mockSetClosing: () => void

  beforeEach(() => {
    mockDispatch = jest.fn(() =>
      Promise.resolve({
        data: {},
      })
    )
    mockSetLoading = jest.fn()
    mockSetClosing = jest.fn()
  })

  describe('with selected scope equal environment', () => {
    data.scope = EnvironmentVariableScopeEnum.ENVIRONMENT
    describe('with public context', () => {
      data.isSecret = false

      it('should ', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })
    })
  })
})
