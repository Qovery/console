import { render } from '@testing-library/react'
import InviteDetailsFeature from './invite-details-feature'

describe('InviteDetailsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InviteDetailsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
