import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { GitProviderSetting } from './git-provider-setting'

describe('GitProviderSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GitProviderSetting />))
    expect(baseElement).toMatchSnapshot()
  })
})
