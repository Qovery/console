import { render } from '@testing-library/react'
import UseProjects from './use-projects'

describe('UseProjects', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UseProjects />)
    expect(baseElement).toBeTruthy()
  })
})
