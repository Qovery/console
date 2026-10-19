import { act, renderHook } from '__tests__/utils/setup-jest'
import ModalProvider from '../../modal/modal-root'
import useModal, { type UseModalProps } from './use-modal'

let mockSetOpenModal = jest.fn()
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

describe('useModal', () => {
  it('does not reopen a closed modal when its effect reconnects', () => {
    const { result, rerender } = renderHook(useModal)
    act(() => result.current.openModal({ content: <div>content</div> }))
    act(() => result.current.closeModal())
    const previousSetter = mockSetOpenModal
    mockSetOpenModal = jest.fn()
    rerender()
    expect(mockSetOpenModal).not.toHaveBeenCalledWith(true)
    mockSetOpenModal = previousSetter
  })

  it('should render successfully', () => {
    const { result } = renderHook(() => useModal())
    expect(result).toBeTruthy()
  })

  it('should run open modal with options', () => {
    const myInitialState: UseModalProps = {
      content: <div>content</div>,
      options: {
        width: 200,
      },
    }
    const { result } = renderHook(useModal, { wrapper: ModalProvider })

    act(() => {
      result.current.openModal(myInitialState)
    })

    expect(mockSetOpenModal).toHaveBeenCalled()
    expect(mockSetContentModal).toHaveBeenCalled()
    expect(mockSetOptionsModal).toHaveBeenCalled()
  })

  it('should run open modal without options', () => {
    const myInitialState: UseModalProps = {
      content: <div>content</div>,
    }
    const { result } = renderHook(useModal, { wrapper: ModalProvider })

    act(() => {
      result.current.openModal(myInitialState)
    })

    expect(mockSetOpenModal).toHaveBeenCalled()
    expect(mockSetContentModal).toHaveBeenCalled()
  })
})
