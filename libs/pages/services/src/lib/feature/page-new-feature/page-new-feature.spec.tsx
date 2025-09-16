import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageNewFeature from './page-new-feature'

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <PageNewFeature />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
