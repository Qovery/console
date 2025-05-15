import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOnboarding from './page-onboarding'

describe('PageOnboarding', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <PageOnboarding />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
