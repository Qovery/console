import { renderWithProviders } from '@qovery/shared/util-tests'
import { Button } from './button'

describe('Button', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<Button type="button">Foobar</Button>)
    expect(baseElement).toMatchSnapshot()
  })
})
