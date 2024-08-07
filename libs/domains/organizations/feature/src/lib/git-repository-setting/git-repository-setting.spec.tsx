import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { GitProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { GitRepositorySetting } from './git-repository-setting'

jest.mock('../hooks/use-repositories/use-repositories', () => {
  return {
    ...jest.requireActual('../hooks/use-repositories/use-repositories'),
    useRepositories: () => ({
      isLoading: false,
      isRefetching: false,
      isError: false,
      data: [
        {
          id: '0000-1111-2222',
          name: 'qovery/console',
          url: 'https://github.com/qovery/console.git',
          branch: 'main',
          is_private: false,
        },
      ],
    }),
  }
})

describe('GitRepositorySetting', () => {
  it('should match snapshot', async () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(
        <GitRepositorySetting
          disabled={false}
          gitProvider={GitProviderEnum.GITHUB}
          urlRepository="https://github.com/qovery/console"
        />
      )
    )
    expect(baseElement).toMatchSnapshot()
  })
})
