import { render } from '__tests__/utils/setup-jest'
import ModalUser from './modal-user'

describe('ModalUser', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalUser />)
    expect(baseElement).toBeTruthy()
  })
})
