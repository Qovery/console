import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { act, renderHook } from '@qovery/shared/util-tests'
import ModalProvider from '../../../modal/modal-root'
import useModalMultiConfirmation, { type UseModalMultiConfirmationProps } from './use-modal-multi-confirmation'

const mockSetOpenModal = jest.fn()
const mockSetContentModal = jest.fn()
const mockSetOptionsModal = jest.fn()

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: () => ({
    setOpenModal: mockSetOpenModal,
    setContentModal: mockSetContentModal,
    setOptionsModal: mockSetOptionsModal,
  }),
}))

describe('useModalMultiConfirmation', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useModalMultiConfirmation())
    expect(result).toBeTruthy()
  })

  it('should run action with preview mode', () => {
    const action = jest.fn()

    const myInitialState: UseModalMultiConfirmationProps = {
      mode: EnvironmentModeEnum.PREVIEW,
      title: 'my-title',
      description: 'my-description',
      checks: [],
      action: action,
    }
    const { result } = renderHook(useModalMultiConfirmation)

    act(() => {
      result.current.openModalMultiConfirmation(myInitialState)
    })

    expect(action).toHaveBeenCalled()
  })

  it('should run action with production mode (display modal)', () => {
    const action = jest.fn()

    const myInitialState: UseModalMultiConfirmationProps = {
      mode: EnvironmentModeEnum.PRODUCTION,
      title: 'my-title',
      description: 'my-description',
      checks: [],
      action: action,
    }
    const { result } = renderHook(useModalMultiConfirmation, { wrapper: ModalProvider })

    act(() => {
      result.current.openModalMultiConfirmation(myInitialState)
    })

    expect(mockSetOpenModal).toHaveBeenCalled()
    expect(mockSetContentModal).toHaveBeenCalled()
  })

  it('should run action with delete props (display modal)', () => {
    const action = jest.fn()

    const myInitialState: UseModalMultiConfirmationProps = {
      mode: EnvironmentModeEnum.PREVIEW,
      title: 'my-title',
      description: 'my-description',
      checks: [],
      action: action,
      isDelete: true,
    }
    const { result } = renderHook(useModalMultiConfirmation, { wrapper: ModalProvider })

    act(() => {
      result.current.openModalMultiConfirmation(myInitialState)
    })

    expect(mockSetOpenModal).toHaveBeenCalled()
    expect(mockSetContentModal).toHaveBeenCalled()
  })
})
