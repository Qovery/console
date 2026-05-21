import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Button } from './button'

describe('Button', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<Button type="button">Foobar</Button>)
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot with loading', () => {
    const { baseElement } = renderWithProviders(
      <Button type="button" loading>
        Foobar
      </Button>
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should support icon spacing', () => {
    renderWithProviders(
      <Button type="button">
        <span>Prefix</span>
        Foobar
        <span>Suffix</span>
      </Button>
    )

    expect(screen.getByRole('button')).toHaveTextContent('PrefixFoobarSuffix')
    expect(screen.getByRole('button')).toHaveClass('gap-x-1')
  })
})
