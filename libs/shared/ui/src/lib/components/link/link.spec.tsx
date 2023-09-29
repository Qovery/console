import { renderWithProviders } from '@qovery/shared/util-tests'
import { ExternalLink, Link } from './link'

describe('Link', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Link to="/">My link</Link>)
    expect(baseElement).toBeTruthy()
  })

  it('should match with Link component', () => {
    const { container } = renderWithProviders(<Link to="/">My link</Link>)
    expect(container).toMatchSnapshot()
  })
})

describe('ExternalLink', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ExternalLink href="https://qovery.com">My external link</ExternalLink>)
    expect(baseElement).toBeTruthy()
  })

  it('should match with ExternalLink component', () => {
    const { container } = renderWithProviders(<ExternalLink href="https://qovery.com">My external link</ExternalLink>)
    expect(container).toMatchSnapshot()
  })
})
