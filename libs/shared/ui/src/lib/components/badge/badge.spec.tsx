import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Badge } from './badge'

describe('Badge', () => {
  it('shoud render children', () => {
    renderWithProviders(<Badge>Foobar</Badge>)
    screen.getByText('Foobar')
  })
  it('shoud match size snapshot', () => {
    const { baseElement } = renderWithProviders(<Badge size="md">Foobar</Badge>)
    expect(baseElement).toMatchSnapshot()
  })
  it('shoud match color snapshot', () => {
    const { baseElement } = renderWithProviders(<Badge color="green">Foobar</Badge>)
    expect(baseElement).toMatchSnapshot()
  })
  it('shoud match variant snapshot', () => {
    const { baseElement } = renderWithProviders(<Badge variant="surface">Foobar</Badge>)
    expect(baseElement).toMatchSnapshot()
  })
})
