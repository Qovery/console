import { renderHook } from '__tests__/utils/setup-jest'
import { useModalAlert } from './use-modal-alert'

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

describe('UseModalAlert', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useModalAlert())
    expect(result).toBeTruthy()
  })
})
