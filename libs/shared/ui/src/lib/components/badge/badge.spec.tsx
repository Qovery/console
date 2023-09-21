import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Badge } from './badge'

describe('Badge', () => {
  it('shoud render children', () => {
    renderWithProviders(<Badge>Foobar</Badge>)
    screen.getByText('Foobar')
  })
})
