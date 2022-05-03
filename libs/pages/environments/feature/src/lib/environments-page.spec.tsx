import { render } from '__tests__/utils/setup-jest'
import EnvironmentsPage from './environments-page'

describe('EnvironmentsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EnvironmentsPage />)
    expect(baseElement).toBeTruthy()
  })
})
