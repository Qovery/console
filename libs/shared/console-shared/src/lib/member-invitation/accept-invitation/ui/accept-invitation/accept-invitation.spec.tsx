import { render } from '__tests__/utils/setup-jest'
import AcceptInvitation from './accept-invitation'

describe('AcceptInvitation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AcceptInvitation onSubmit={jest.fn()} />)
    expect(baseElement).toBeTruthy()
  })
})
