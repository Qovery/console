import { render } from '@testing-library/react'
import AcceptInvitation from './accept-invitation'

describe('AcceptInvitation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AcceptInvitation />)
    expect(baseElement).toBeTruthy()
  })
})
