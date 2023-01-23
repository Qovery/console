import { render } from '__tests__/utils/setup-jest'
import AboutGit from './about-git'

describe('AboutGit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutGit />)
    expect(baseElement).toBeTruthy()
  })
})
