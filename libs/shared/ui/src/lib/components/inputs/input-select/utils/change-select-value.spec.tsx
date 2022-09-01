import { getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { InputSelectProps } from '@console/shared/ui'
import InputSelect from '../input-select'
import { changeSelectValueByLabel } from './change-select-value'

describe('changeSelectValueByLabel', () => {
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

  it('should select the first value', async () => {
    const { baseElement } = render(<InputSelect {...props} />)

    await changeSelectValueByLabel(baseElement, 'input-select', 'some-label')

    expect(getByTestId(baseElement, 'input-select-value').innerHTML).toBe('some-label')
  })
})
