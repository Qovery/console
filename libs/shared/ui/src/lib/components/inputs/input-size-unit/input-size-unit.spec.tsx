import { render } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import InputSizeUnit, { InputSizeUnitProps } from './input-size-unit'

const props: InputSizeUnitProps = {
  name: 'memory',
  maxSize: 5024,
  minSize: 100,
  getUnit: jest.fn(),
  currentSize: 1024,
}

describe('InputSizeUnit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<InputSizeUnit {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render current consumption for memory with GB', () => {
    props.currentSize = 1024

    const { getByTestId } = render(wrapWithReactHookForm(<InputSizeUnit {...props} />))
    expect(getByTestId('current-consumption').textContent).toBe('Current consumption: 1 GB')
  })

  it('should render current consumption for memory with MB', () => {
    props.currentSize = 100

    const { getByTestId } = render(wrapWithReactHookForm(<InputSizeUnit {...props} />))
    expect(getByTestId('current-consumption').textContent).toBe('Current consumption: 100 MB')
  })
})
