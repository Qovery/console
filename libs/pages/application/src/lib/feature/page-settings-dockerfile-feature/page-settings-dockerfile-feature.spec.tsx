import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { PageSettingsDockerfileFeature } from './page-settings-dockerfile-feature'

describe('PageSettingsDockerfileFeature', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<PageSettingsDockerfileFeature />))
    expect(baseElement).toMatchSnapshot()
  })
})
