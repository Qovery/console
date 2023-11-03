import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { GitBranchSettings } from './git-branch-settings'

jest.mock('../hooks/use-branches/use-branches', () => {
  return {
    ...jest.requireActual('../hooks/use-branches/use-branches'),
    useBranches: () => ({
      isLoading: false,
      isRefetching: false,
      data: [
        {
          name: 'main',
        },
      ],
    }),
  }
})

describe('GitBranchSettings', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GitBranchSettings gitProvider="GITHUB" />))
    expect(baseElement).toMatchSnapshot()
  })
})
