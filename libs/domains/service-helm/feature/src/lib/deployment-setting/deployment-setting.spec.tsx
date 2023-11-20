import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { DeploymentSetting } from './deployment-setting'

describe('DeploymentSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<DeploymentSetting />))
    expect(baseElement).toMatchSnapshot()
  })
})
