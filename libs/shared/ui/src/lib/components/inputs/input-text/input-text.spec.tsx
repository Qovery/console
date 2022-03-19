import { render } from '__tests__/utils/setup-jest'

import InputText from './input-text'

describe('InputText', () => {
  const props = {
    name: 'some name',
    label: 'some label',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<InputText name={props.name} label={props.label} />)
    expect(baseElement).toBeTruthy()
  })
})
