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

  it('should support icon alignment markers', () => {
    renderWithProviders(
      <Button type="button">
        <span data-align="prefix">Prefix</span>
        Foobar
        <span data-align="suffix">Suffix</span>
      </Button>
    )

    expect(screen.getByRole('button')).toHaveTextContent('PrefixFoobarSuffix')
    expect(screen.getByRole('button').className).toContain('[&_[data-align=prefix]]:mr-1')
    expect(screen.getByRole('button').className).toContain('[&_[data-align=suffix]]:ml-1')
  })
})
