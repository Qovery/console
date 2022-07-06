import PageVariables from './page-variables'
import { render } from '__tests__/utils/setup-jest'

const props = {}

describe('PageVariables', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageVariables {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
