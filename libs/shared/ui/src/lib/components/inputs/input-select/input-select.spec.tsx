import { render } from '__tests__/utils/setup-jest'

import InputSelect, { InputSelectProps } from './input-select'

describe('InputSelect', () => {
  let props: InputSelectProps

  beforeEach(() => {
    props = {
      name: 'some-name',
      label: 'some-label',
      items: [{ label: 'some-label', value: 'some-value' }],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InputSelect {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
