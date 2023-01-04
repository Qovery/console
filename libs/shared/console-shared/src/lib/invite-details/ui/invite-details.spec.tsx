import { render } from '__tests__/utils/setup-jest'
import InviteDetails from './invite-details'

describe('InviteDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InviteDetails />)
    expect(baseElement).toBeTruthy()
  })
})
