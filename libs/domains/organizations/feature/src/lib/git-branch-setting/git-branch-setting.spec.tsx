import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { GitBranchSetting } from './git-branch-setting'

describe('GitBranchSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GitBranchSetting />))
    expect(baseElement).toMatchSnapshot()
  })
})
