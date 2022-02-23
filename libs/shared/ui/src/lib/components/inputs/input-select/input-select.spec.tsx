import { render } from '__mocks__/utils/test-utils'

import InputSelect, { InputSelectProps } from './input-select'

describe('InputSelect', () => {
  const props: InputSelectProps = {
    name: '',
    label: '',
    items: [{ label: '', value: '' }],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<InputSelect name={props.name} label={props.label} items={props.items} />)
    expect(baseElement).toBeTruthy()
  })
})
