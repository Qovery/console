import { render } from '@testing-library/react'
import AboutGit from './about-git'

describe('AboutGit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutGit />)
    expect(baseElement).toBeTruthy()
  })
})
