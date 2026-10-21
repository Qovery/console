import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { Suspense } from 'react'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { EditGitRepositorySettings } from './edit-git-repository-settings'

jest.mock('../../hooks/use-git-tokens/use-git-tokens', () => ({
  ...jest.requireActual('../../hooks/use-git-tokens/use-git-tokens'),
  useGitTokens: () => ({ data: [], isLoading: false }),
}))

describe('EditGitRepositorySettings', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(
        <Suspense fallback={<div />}>
          <EditGitRepositorySettings organizationId="org-id" />
        </Suspense>
      )
    )
    expect(baseElement).toBeTruthy()
  })
})
