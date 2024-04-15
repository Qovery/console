import { renderWithProviders } from '@qovery/shared/util-tests'
import { PageGeneral } from './page-general'

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageGeneral serviceId="1" environmentId="1" isCronJob={false} />)
    expect(baseElement).toBeTruthy()
  })
})
