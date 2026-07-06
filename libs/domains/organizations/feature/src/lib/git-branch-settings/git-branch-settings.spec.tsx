import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { GitBranchSettings } from './git-branch-settings'

let mockBranches: { name: string }[] = [
  {
    name: 'main',
  },
]

jest.mock('../hooks/use-branches/use-branches', () => {
  return {
    ...jest.requireActual('../hooks/use-branches/use-branches'),
    useBranches: () => ({
      isLoading: false,
      isRefetching: false,
      data: mockBranches,
    }),
  }
})

describe('GitBranchSettings', () => {
  beforeEach(() => {
    mockBranches = [
      {
        name: 'main',
      },
    ]
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<GitBranchSettings organizationId="org-1" gitProvider="GITHUB" />)
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should display the selected branch when it is not part of returned branches', () => {
    mockBranches = [
      {
        name: 'develop',
      },
    ]

    renderWithProviders(
      wrapWithReactHookForm(<GitBranchSettings organizationId="org-1" gitProvider="GITHUB" />, {
        defaultValues: {
          branch: 'main',
        },
      })
    )

    expect(screen.getByText('main')).toBeInTheDocument()
  })
})
