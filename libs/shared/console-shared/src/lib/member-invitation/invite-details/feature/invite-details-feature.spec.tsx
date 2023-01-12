import { render } from '__tests__/utils/setup-jest'
import InviteDetailsFeature from './invite-details-feature'

describe('InviteDetailsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InviteDetailsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
