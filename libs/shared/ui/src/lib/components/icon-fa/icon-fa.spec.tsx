import { render } from '__tests__/utils/setup-jest'
import IconFlag, { IconFlagProps } from './icon-fa'

describe('IconFlag', () => {
  let props: IconFlagProps

  beforeEach(() => {
    props = {
      name: 'default',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<IconFlag {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
