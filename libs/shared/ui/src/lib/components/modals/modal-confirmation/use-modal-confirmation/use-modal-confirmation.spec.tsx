import { act, renderHook } from '__tests__/utils/setup-jest'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import ModalProvider from '../../../modal/modal-root'
import useModalConfirmation, { type UseModalConfirmationProps } from './use-modal-confirmation'

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

describe('useModalConfirmation', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useModalConfirmation())
    expect(result).toBeTruthy()
  })

  it('should run action with preview mode', () => {
    const action = jest.fn()

    const myInitialState: UseModalConfirmationProps = {
      mode: EnvironmentModeEnum.PREVIEW,
      title: 'my-title',
      description: 'my-description',
      name: 'test',
      action: action,
    }
    const { result } = renderHook(useModalConfirmation)

    act(() => {
      result.current.openModalConfirmation(myInitialState)
    })

    expect(action).toHaveBeenCalled()
  })

  it('should run action with production mode (display modal)', () => {
    const action = jest.fn()

    const myInitialState: UseModalConfirmationProps = {
      mode: EnvironmentModeEnum.PRODUCTION,
      title: 'my-title',
      description: 'my-description',
      name: 'test',
      action: action,
    }
    const { result } = renderHook(useModalConfirmation, { wrapper: ModalProvider })

    act(() => {
      result.current.openModalConfirmation(myInitialState)
    })

    expect(mockSetOpenModal).toHaveBeenCalled()
    expect(mockSetContentModal).toHaveBeenCalled()
  })
})

it('should run action with delete props (display modal)', () => {
  const action = jest.fn()

  const myInitialState: UseModalConfirmationProps = {
    mode: EnvironmentModeEnum.PREVIEW,
    title: 'my-title',
    description: 'my-description',
    name: 'test',
    action: action,
    isDelete: true,
  }
  const { result } = renderHook(useModalConfirmation, { wrapper: ModalProvider })

  act(() => {
    result.current.openModalConfirmation(myInitialState)
  })

  expect(mockSetOpenModal).toHaveBeenCalled()
  expect(mockSetContentModal).toHaveBeenCalled()
})
