import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Icon } from '../icon/icon'
import { Avatar } from './avatar'

describe('Avatar', () => {
  it('should match snapshot', async () => {
    const { baseElement } = renderWithProviders(<Avatar fallback={<Icon data-testid="foobar" name="ENVIRONMENT" />} />)
    await screen.findByTestId('foobar')
    expect(baseElement).toMatchSnapshot()
  })
})
