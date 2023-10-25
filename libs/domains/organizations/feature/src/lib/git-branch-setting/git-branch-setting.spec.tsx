import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { GitBranchSetting } from './git-branch-setting'

jest.mock('../hooks/use-branches/use-branches', () => {
  return {
    ...jest.requireActual('../hooks/use-branches/use-branches'),
    useGitTokens: () => ({
      data: [
        {
          name: 'main',
        },
      ],
    }),
  }
})

describe('GitBranchSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GitBranchSetting gitProvider="GITHUB" />))
    expect(baseElement).toMatchSnapshot()
  })
})
