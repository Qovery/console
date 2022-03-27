import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'

import Navbar, { NavbarProps } from './navbar'

describe('Navbar', () => {
  let props: NavbarProps

  beforeEach(() => {
    props = {
      progress: 100,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Navbar />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate class when the progress is positive', () => {
    render(<Navbar {...props} />)

    const progressContainer = screen.getByLabelText('progress-container')

    expect(progressContainer.className).toContain('bg-element-light-lighter-500')
  })
})
