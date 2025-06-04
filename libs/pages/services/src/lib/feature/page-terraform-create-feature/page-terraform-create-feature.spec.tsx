import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageTerraformCreateFeature from './page-terraform-create-feature'

describe('PageTerraformCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <PageTerraformCreateFeature />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
