import { render } from '__tests__/utils/setup-jest'
import Link, { type LinkProps } from './link'

const props: LinkProps = {
  linkLabel: 'link-label',
  link: '/test',
}

describe('Link', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Link {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
