import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { Suspense } from 'react'
import { renderWithProviders } from '@qovery/shared/util-tests'
import EditGitRepositorySettingsFeature from './edit-git-repository-settings-feature'

describe('EditGitRepositorySettingsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(
        <Suspense fallback={<div />}>
          <EditGitRepositorySettingsFeature />
        </Suspense>
      )
    )
    expect(baseElement).toBeTruthy()
  })
})
