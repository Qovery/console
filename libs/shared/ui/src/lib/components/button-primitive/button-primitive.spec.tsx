import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ButtonPrimitive } from './button-primitive'

describe('ButtonPrimitive', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ButtonPrimitive type="button">Foobar</ButtonPrimitive>)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render icon alignment markers around children', () => {
    renderWithProviders(
      <ButtonPrimitive type="button">
        <span data-align="prefix">Prefix</span>
        Foobar
        <span data-align="suffix">Suffix</span>
      </ButtonPrimitive>
    )

    expect(screen.getByRole('button')).toHaveTextContent('PrefixFoobarSuffix')
  })

  it('should use compact icon margins for xs and sm buttons', () => {
    renderWithProviders(
      <>
        <ButtonPrimitive type="button" size="xs">
          <span data-align="prefix">Prefix</span>
          Extra small
        </ButtonPrimitive>
        <ButtonPrimitive type="button" size="sm">
          Small
          <span data-align="suffix">Suffix</span>
        </ButtonPrimitive>
      </>
    )

    expect(screen.getByText('Extra small').closest('button')?.className).toContain('[&_[data-align=prefix]]:mr-1')
    expect(screen.getByText('Small').closest('button')?.className).toContain('[&_[data-align=suffix]]:ml-1')
  })

  it('should use larger icon margins for md and lg buttons', () => {
    renderWithProviders(
      <>
        <ButtonPrimitive type="button" size="md">
          <span data-align="prefix">Prefix</span>
          Medium
        </ButtonPrimitive>
        <ButtonPrimitive type="button" size="lg">
          Large
          <span data-align="suffix">Suffix</span>
        </ButtonPrimitive>
      </>
    )

    expect(screen.getByText('Medium').closest('button')?.className).toContain('[&_[data-align=prefix]]:mr-1.5')
    expect(screen.getByText('Large').closest('button')?.className).toContain('[&_[data-align=suffix]]:ml-1.5')
  })
})
