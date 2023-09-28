import { renderWithProviders } from '@qovery/shared/util-tests'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { ActionLink, ExternalLink, Link } from './link'

describe('Link', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Link to="/">My link</Link>)
    expect(baseElement).toBeTruthy()
  })

  it('should match with Link component', () => {
    const { container } = renderWithProviders(
      <Link to="/" icon={IconAwesomeEnum.CIRCLE_PLUS}>
        My link
      </Link>
    )
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

describe('ActionLink', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ActionLink onClick={() => console.log('hello world')}>My external link</ActionLink>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should match with ActionLink component', () => {
    const { container } = renderWithProviders(
      <ActionLink onClick={() => console.log('hello world')}>My action link</ActionLink>
    )
    expect(container).toMatchSnapshot()
  })
})
