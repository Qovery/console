import { render } from '__tests__/utils/setup-jest'

import Tag, { TagProps } from './tag'

describe('Tag', () => {
  let props: TagProps
  it('should render successfully', () => {
    const { baseElement } = render(<Tag {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
