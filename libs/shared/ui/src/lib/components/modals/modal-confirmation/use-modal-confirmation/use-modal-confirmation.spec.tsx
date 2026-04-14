import { act, renderHook } from '__tests__/utils/setup-jest'
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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { result } = renderHook(() => useModalConfirmation())
    expect(result).toBeTruthy()
  })

  it('should display a confirmation modal by default', () => {
    const action = jest.fn()

    const myInitialState: UseModalConfirmationProps = {
      title: 'my-title',
      description: 'my-description',
      name: 'test',
      action: action,
    }
    const { result } = renderHook(useModalConfirmation)

    act(() => {
      result.current.openModalConfirmation(myInitialState)
    })

    expect(action).not.toHaveBeenCalled()
    expect(mockSetOpenModal).toHaveBeenCalled()
    expect(mockSetContentModal).toHaveBeenCalled()
  })

  it('should display a name confirmation modal', () => {
    const action = jest.fn()

    const myInitialState: UseModalConfirmationProps = {
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

  it('should run action with delete props (display modal)', () => {
    const action = jest.fn()

    const myInitialState: UseModalConfirmationProps = {
      title: 'my-title',
      description: 'my-description',
      name: 'test',
      action: action,
      confirmationMethod: 'action',
    }
    const { result } = renderHook(useModalConfirmation, { wrapper: ModalProvider })

    act(() => {
      result.current.openModalConfirmation(myInitialState)
    })

    expect(mockSetOpenModal).toHaveBeenCalled()
    expect(mockSetContentModal).toHaveBeenCalled()
  })
})
