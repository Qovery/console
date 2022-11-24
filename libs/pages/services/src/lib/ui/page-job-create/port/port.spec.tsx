import { render } from '__tests__/utils/setup-jest'
import Port from './port'

describe('Port', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Port />)
    expect(baseElement).toBeTruthy()
  })
})
