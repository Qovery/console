import { render } from '@testing-library/react'
import InviteDetails from './invite-details'

describe('InviteDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InviteDetails />)
    expect(baseElement).toBeTruthy()
  })
})
