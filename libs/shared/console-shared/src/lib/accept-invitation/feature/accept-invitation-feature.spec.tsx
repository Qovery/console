import { render } from '@testing-library/react'
import AcceptInvitationFeature from './accept-invitation-feature'

describe('AcceptInvitationFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AcceptInvitationFeature />)
    expect(baseElement).toBeTruthy()
  })
})
