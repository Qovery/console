import {
  CrudEnvironmentVariableModalFeatureProps,
  DataFormEnvironmentVariableInterface,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../crud-environment-variable-modal-feature'
import { mockEnvironmentVariable } from '@console/domains/environment-variable'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { handleSubmitForEnvSecretCreation } from './handle-submit'
import { waitFor } from '@testing-library/react'

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

  let mockDispatch: () => void
  const mockSetLoading = jest.fn()
  const mockSetClosing = jest.fn()

  describe('with public context', () => {
    beforeEach(() => {
      mockDispatch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            data: {},
          })
        )
        .mockImplementationOnce(() => ({
          unwrap: () =>
            Promise.resolve({
              data: {},
            }),
        }))
      data.isSecret = false
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('with selected scope equal environment', () => {
      data.scope = EnvironmentVariableScopeEnum.ENVIRONMENT

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalledTimes(1)
        expect(mockSetClosing).toHaveBeenCalled()
      })
    })

    it('should dispatch edit', async () => {
      props.mode = EnvironmentVariableCrudMode.EDITION
      await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled()
        expect(mockSetLoading).toHaveBeenCalledTimes(2)
        expect(mockSetClosing).toHaveBeenCalled()
      })
    })

    describe('with selected scope equal project', () => {
      data.scope = EnvironmentVariableScopeEnum.PROJECT

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled()
          expect(mockSetLoading).toHaveBeenCalledTimes(2)
          expect(mockSetClosing).toHaveBeenCalled()
        })
      })
    })

    describe('with selected scope equal application', () => {
      data.scope = EnvironmentVariableScopeEnum.APPLICATION

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled()
          expect(mockSetLoading).toHaveBeenCalledTimes(2)
          expect(mockSetClosing).toHaveBeenCalled()
        })
      })

      it('should dispatch the override action', async () => {
        props.type = EnvironmentVariableType.OVERRIDE
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled()
          expect(mockSetLoading).toHaveBeenCalledTimes(2)
          expect(mockSetClosing).toHaveBeenCalled()
        })
      })

      it('should dispatch the alias action', async () => {
        props.type = EnvironmentVariableType.ALIAS
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled()
          expect(mockSetLoading).toHaveBeenCalledTimes(2)
          expect(mockSetClosing).toHaveBeenCalled()
        })
      })
    })
  })

  describe('with secret context', () => {
    beforeEach(() => {
      mockDispatch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            data: {},
          })
        )
        .mockImplementationOnce(() => ({
          unwrap: () =>
            Promise.resolve({
              data: {},
            }),
        }))
      data.isSecret = true
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('with selected scope equal environment', () => {
      data.scope = EnvironmentVariableScopeEnum.ENVIRONMENT

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled()
          expect(mockSetLoading).toHaveBeenCalledTimes(2)
          expect(mockSetClosing).toHaveBeenCalled()
        })
      })
    })

    describe('with selected scope equal project', () => {
      data.scope = EnvironmentVariableScopeEnum.PROJECT

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled()
          expect(mockSetLoading).toHaveBeenCalledTimes(2)
          expect(mockSetClosing).toHaveBeenCalled()
        })
      })
    })

    describe('with selected scope equal application', () => {
      data.scope = EnvironmentVariableScopeEnum.APPLICATION

      it('should dispatch set loading and trigger the closing', async () => {
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled()
          expect(mockSetLoading).toHaveBeenCalledTimes(2)
          expect(mockSetClosing).toHaveBeenCalled()
        })
      })

      it('should dispatch the override action', async () => {
        props.type = EnvironmentVariableType.OVERRIDE
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled()
          expect(mockSetLoading).toHaveBeenCalledTimes(2)
          expect(mockSetClosing).toHaveBeenCalled()
        })
      })

      it('should dispatch the alias action', async () => {
        props.type = EnvironmentVariableType.ALIAS
        await handleSubmitForEnvSecretCreation(data, mockSetLoading, props, mockDispatch, mockSetClosing)

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled()
          expect(mockSetLoading).toHaveBeenCalledTimes(2)
          expect(mockSetClosing).toHaveBeenCalled()
        })
      })
    })
  })
})
