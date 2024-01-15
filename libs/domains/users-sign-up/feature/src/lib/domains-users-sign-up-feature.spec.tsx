import { render } from '@testing-library/react'
import DomainsUsersSignUpFeature from './domains-users-sign-up-feature'

describe('DomainsUsersSignUpFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DomainsUsersSignUpFeature />)
    expect(baseElement).toBeTruthy()
  })
})
