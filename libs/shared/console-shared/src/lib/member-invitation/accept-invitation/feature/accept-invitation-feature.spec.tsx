import { render } from '__tests__/utils/setup-jest'
import AcceptInvitationFeature from './accept-invitation-feature'

describe('AcceptInvitationFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AcceptInvitationFeature />)
    expect(baseElement).toBeTruthy()
  })
})
