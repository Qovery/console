import { renderWithProviders } from '@qovery/shared/util-tests'
import { ButtonPrimitive } from './button-primitive'

describe('ButtonPrimitive', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ButtonPrimitive type="button">Foobar</ButtonPrimitive>)
    expect(baseElement).toMatchSnapshot()
  })
})
