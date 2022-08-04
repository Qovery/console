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
    closeModal: mockSetOpen,
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

  describe('with public context', () => {
    beforeEach(() => {
      data.isSecret = false
    })

    describe('with selected scope equal environment', () => {
      data.scope = EnvironmentVariableScopeEnum.ENVIRONMENT

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })
    })

    it('should dispatch edit', async () => {
      props.mode = EnvironmentVariableCrudMode.EDITION
      await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

      expect(mockDispatch).toHaveBeenCalled()
      expect(mockSetLoading).toHaveBeenCalled()
      expect(mockSetClosing).toHaveBeenCalled()
    })

    describe('with selected scope equal project', () => {
      data.scope = EnvironmentVariableScopeEnum.PROJECT

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })
    })

    describe('with selected scope equal application', () => {
      data.scope = EnvironmentVariableScopeEnum.APPLICATION

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })

      it('should dispatch the override action', async () => {
        props.type = EnvironmentVariableType.OVERRIDE
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })

      it('should dispatch the alias action', async () => {
        props.type = EnvironmentVariableType.ALIAS
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })
    })
  })

  describe('with secret context', () => {
    beforeEach(() => {
      data.isSecret = true
    })

    describe('with selected scope equal environment', () => {
      data.scope = EnvironmentVariableScopeEnum.ENVIRONMENT

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })
    })

    describe('with selected scope equal project', () => {
      data.scope = EnvironmentVariableScopeEnum.PROJECT

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })
    })

    describe('with selected scope equal application', () => {
      data.scope = EnvironmentVariableScopeEnum.APPLICATION

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })

      it('should dispatch the override action', async () => {
        props.type = EnvironmentVariableType.OVERRIDE
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })

      it('should dispatch the alias action', async () => {
        props.type = EnvironmentVariableType.ALIAS
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalled()
        expect(mockSetClosing).toHaveBeenCalled()
      })
    })
  })
})
