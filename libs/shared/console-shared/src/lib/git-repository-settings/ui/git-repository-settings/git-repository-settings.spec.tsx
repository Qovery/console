import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { GitProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import GitRepositorySettings, { type GitRepositorySettingsProps } from './git-repository-settings'

const mockOpenModal = jest.fn()
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
  }),
}))

describe('GitRepositorySettings', () => {
  const props: GitRepositorySettingsProps = {
    gitDisabled: true,
    editGitSettings: jest.fn(),
    currentProvider: 'GITHUB',
    currentRepository: 'qovery/console',
  }

  const defaultValues = {
    provider: GitProviderEnum.GITHUB,
    repository: 'qovery/console',
    branch: 'main',
    root_path: '/',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GitRepositorySettings {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render disabled fields', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    screen.getByDisplayValue(defaultValues.provider)
    screen.getByDisplayValue(defaultValues.repository)
    screen.getByDisplayValue(defaultValues.branch)
    screen.getByDisplayValue(defaultValues.root_path)
  })

  it('should dispatch open modal if click on edit', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const buttonEdit = screen.getByText('Edit')
    await userEvent.click(buttonEdit)

    expect(mockOpenModal).toHaveBeenCalled()
  })
})
