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
  it('does not replay a consumed opening request when the effect reconnects', () => {
    const { result, rerender } = renderHook(useModal)
    act(() => result.current.openModal({ content: <div>content</div> }))
    const previousSetter = mockSetOpenModal
    mockSetOpenModal = jest.fn()
    rerender()
    expect(mockSetOpenModal).not.toHaveBeenCalledWith(true)
    mockSetOpenModal = previousSetter
  })

  it('can explicitly reopen the same modal after its request is consumed', () => {
    const { result } = renderHook(useModal)
    const modal = { content: <div>content</div> }
    act(() => result.current.openModal(modal))
    mockSetOpenModal.mockClear()
    act(() => result.current.openModal(modal))
    expect(mockSetOpenModal).toHaveBeenCalledWith(true)
  })

  it('preserves a newer opening request queued while the previous one is displayed', () => {
    const { result } = renderHook(useModal)
    const nextModal = { content: <div>next modal</div> }
    mockSetContentModal.mockImplementationOnce(() => result.current.openModal(nextModal))

    act(() => result.current.openModal({ content: <div>first modal</div> }))

    expect(mockSetContentModal).toHaveBeenLastCalledWith(
      expect.objectContaining({ props: { children: nextModal.content } })
    )
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
