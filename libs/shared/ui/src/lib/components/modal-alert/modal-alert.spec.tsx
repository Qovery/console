import { render } from '__tests__/utils/setup-jest'
import ModalAlert from './modal-alert'

describe('ModalAlert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalAlert isOpen={false} />)
    expect(baseElement).toBeTruthy()
  })
})
