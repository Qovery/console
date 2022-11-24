import { render } from '__tests__/utils/setup-jest'
import PortFeature from './port-feature'

describe('PortFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PortFeature />)
    expect(baseElement).toBeTruthy()
  })
})
