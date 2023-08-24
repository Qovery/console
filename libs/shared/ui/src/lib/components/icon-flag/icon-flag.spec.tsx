import { render } from '__tests__/utils/setup-jest'
import IconFlag, { type IconFlagProps } from './icon-flag'

describe('IconFlag', () => {
  let props: IconFlagProps

  beforeEach(() => {
    props = {
      code: 'default',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<IconFlag {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
