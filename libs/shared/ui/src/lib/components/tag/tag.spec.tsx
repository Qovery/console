import { render, screen } from '__tests__/utils/setup-jest'
import Tag, { type TagProps, TagSize } from './tag'

let props: TagProps

beforeEach(() => {
  props = {
    children: 'Tag',
  }
})

describe('Tag', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Tag {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('shoud have the right size', () => {
    props.size = TagSize.BIG
    render(<Tag {...props} />)
    const tag = screen.getByTestId('tag')
    expect(tag).toHaveClass('h-8')
  })
})
