import { render } from '__tests__/utils/setup-jest'
import InputSelectSmall, { type InputSelectSmallProps } from './input-select-small'

describe('InputSelectSmall', () => {
  let props: InputSelectSmallProps

  beforeEach(() => {
    props = {
      name: '',
      label: '',
      items: [{ label: '', value: '' }],
    }
  })
  it('should render successfully', () => {
    const { baseElement } = render(<InputSelectSmall {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
