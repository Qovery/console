import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageHelmCreateFeature from './page-helm-create-feature'

describe('PageHelmCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <PageHelmCreateFeature />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
