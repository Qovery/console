import { render } from '__tests__/utils/setup-jest'

import InputSelectMultiple, { InputSelectMultipleProps } from './input-select-multiple'

let props: InputSelectMultipleProps

beforeEach(() => {
  props = {
    label: 'Select Multiple',
    options: [
      { label: 'Test 1', value: 'test1' },
      { label: 'Test 2', value: 'test3' },
    ],
  }
})

describe('InputSelectMultiple', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSelectMultiple {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
