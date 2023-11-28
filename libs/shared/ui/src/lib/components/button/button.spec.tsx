import { renderWithProviders } from '@qovery/shared/util-tests'
import { Button } from './button'

describe('Button', () => {
  it('should match snapshot with loading', () => {
    const { baseElement } = renderWithProviders(
      <Button type="button" loading>
        Foobar
      </Button>
    )
    expect(baseElement).toMatchSnapshot()
  })
})
