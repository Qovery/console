import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { AutoDeploySetting } from './auto-deploy-setting'

describe('AutoDeploySetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<AutoDeploySetting source="GIT" />))
    expect(baseElement).toMatchSnapshot()
  })
})
