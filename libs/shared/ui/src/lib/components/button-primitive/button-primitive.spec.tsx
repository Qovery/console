import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ButtonPrimitive } from './button-primitive'

describe('ButtonPrimitive', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ButtonPrimitive type="button">Foobar</ButtonPrimitive>)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render children with icon spacing', () => {
    renderWithProviders(
      <ButtonPrimitive type="button">
        <span>Prefix</span>
        Foobar
        <span>Suffix</span>
      </ButtonPrimitive>
    )

    expect(screen.getByRole('button')).toHaveTextContent('PrefixFoobarSuffix')
  })

  it('should use compact icon gaps for xs and sm buttons', () => {
    renderWithProviders(
      <>
        <ButtonPrimitive type="button" size="xs">
          <span>Prefix</span>
          Extra small
        </ButtonPrimitive>
        <ButtonPrimitive type="button" size="sm">
          Small
          <span>Suffix</span>
        </ButtonPrimitive>
      </>
    )

    expect(screen.getByRole('button', { name: /Extra small/ })).toHaveClass('gap-x-1')
    expect(screen.getByRole('button', { name: /Small/ })).toHaveClass('gap-x-1')
  })

  it('should use larger icon gaps for md and lg buttons', () => {
    renderWithProviders(
      <>
        <ButtonPrimitive type="button" size="md">
          <span>Prefix</span>
          Medium
        </ButtonPrimitive>
        <ButtonPrimitive type="button" size="lg">
          Large
          <span>Suffix</span>
        </ButtonPrimitive>
      </>
    )

    expect(screen.getByRole('button', { name: /Medium/ })).toHaveClass('gap-x-1.5')
    expect(screen.getByRole('button', { name: /Large/ })).toHaveClass('gap-x-1.5')
  })
})
