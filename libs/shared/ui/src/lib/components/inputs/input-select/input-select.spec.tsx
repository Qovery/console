import { getByTestId } from '@testing-library/react'
import { changeSelectValueByLabel } from '__tests__/utils/changes-select-value'
import { render } from '__tests__/utils/setup-jest'
import InputSelect, { InputSelectProps } from './input-select'

describe('InputSelect', () => {
  let props: InputSelectProps

  beforeEach(() => {
    props = {
      label: 'List Label',
      items: [
        { label: 'some-label', value: 'some-value' },
        { label: 'some-label-2', value: 'some-value-2' },
      ],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InputSelect {...props} />)

    expect(baseElement).toBeTruthy()
  })

  it('should select second item from list', async () => {
    const { baseElement } = render(<InputSelect {...props} />)

    await changeSelectValueByLabel(baseElement, 'input-select', 'some-label-2')

    expect(getByTestId(baseElement, 'input-select-value').innerHTML).toBe('some-label-2')
  })
})
