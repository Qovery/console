import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import InputSizeUnit, { type InputSizeUnitProps } from './input-size-unit'

const props: InputSizeUnitProps = {
  name: 'memory',
  maxSize: 5024,
  minSize: 100,
  getUnit: jest.fn(),
  currentSize: 1024,
}

describe('InputSizeUnit', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<InputSizeUnit {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render current consumption for memory with GB', () => {
    props.currentSize = 1024

    renderWithProviders(wrapWithReactHookForm(<InputSizeUnit {...props} />))
    expect(screen.getByTestId('current-consumption')).toHaveTextContent('Current consumption: 1 GB')
  })

  it('should render current consumption for memory with MB', () => {
    props.currentSize = 100

    renderWithProviders(wrapWithReactHookForm(<InputSizeUnit {...props} />))
    expect(screen.getByTestId('current-consumption')).toHaveTextContent('Current consumption: 100 MB')
  })
})
