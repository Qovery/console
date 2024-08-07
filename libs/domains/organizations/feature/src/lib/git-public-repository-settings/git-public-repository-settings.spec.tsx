import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { GitPublicRepositorySettings } from './git-public-repository-settings'

describe('GitPublicRepositorySettings', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<GitPublicRepositorySettings urlRepository="https://github.com/qovery/console" />)
    )
    expect(baseElement).toMatchSnapshot()
  })
})
