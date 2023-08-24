import { render } from '__tests__/utils/setup-jest'
import IconFa, { type IconFaProps } from './icon-fa'

describe('IconFa', () => {
  let props: IconFaProps

  beforeEach(() => {
    props = {
      name: 'default',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<IconFa {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
