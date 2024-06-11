import { render, screen } from '__tests__/utils/setup-jest'
import Navbar, { type NavbarProps } from './navbar'

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

    expect(progressContainer).toHaveClass('bg-neutral-250')
  })
})
