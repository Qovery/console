import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ValuesOverrideYamlSetting, ValuesOverrideYamlSettingBase } from './values-override-yaml-setting'

const mockOpenModal = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    environmentId: 'env-from-router',
  }),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
  }),
  CodeEditorInlineSetting: ({ onOpenModal }: { onOpenModal: () => void }) => (
    <button type="button" onClick={onOpenModal}>
      Open YAML modal
    </button>
  ),
}))

jest.mock('../values-override-yaml-modal/values-override-yaml-modal', () => ({
  __esModule: true,
  default: ({ environmentId }: { environmentId: string }) => <div data-testid="yaml-modal">{environmentId}</div>,
}))

describe('ValuesOverrideYamlSetting', () => {
  beforeEach(() => {
    mockOpenModal.mockClear()
  })

  it('should use the provided environmentId when opening the modal', async () => {
    const { userEvent } = renderWithProviders(
      <ValuesOverrideYamlSettingBase
        environmentId="env-from-prop"
        content="key: value"
        onSubmit={jest.fn()}
        source={{
          git_repository: {
            url: 'https://github.com/Qovery/console',
            branch: 'main',
            root_path: '/',
            git_token_id: 'token',
          },
        }}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Open YAML modal' }))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
    expect(mockOpenModal.mock.calls[0][0].content.props.environmentId).toBe('env-from-prop')
  })

  it('should fallback to router params when environmentId is not provided', async () => {
    const { userEvent } = renderWithProviders(
      <ValuesOverrideYamlSetting
        onSubmit={jest.fn()}
        source={{
          git_repository: {
            url: 'https://github.com/Qovery/console',
            branch: 'main',
            root_path: '/',
            git_token_id: 'token',
          },
        }}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Open YAML modal' }))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
    expect(mockOpenModal.mock.calls[0][0].content.props.environmentId).toBe('env-from-router')
  })
})
