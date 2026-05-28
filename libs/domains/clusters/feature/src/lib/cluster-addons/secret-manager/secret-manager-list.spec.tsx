import { type ExternalSecretAssociatedServiceResponse, type SecretManagerAccess } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useSecretManagerAssociatedServices from '../../hooks/use-secret-manager-associated-services/use-secret-manager-associated-services'
import { SecretManagerList } from './secret-manager-list'

const useSecretManagerAssociatedServicesMockSpy = jest.spyOn(
  useSecretManagerAssociatedServices,
  'useSecretManagerAssociatedServices'
) as jest.Mock

const secretManager = {
  id: 'secret-manager-id',
  name: 'AWS SM',
  endpoint: {
    mode: 'AWS_SECRET_MANAGER',
  },
  authentication: {
    mode: 'AWS_ROLE_ARN',
  },
} as SecretManagerAccess

const renderSecretManagerList = ({
  associatedExternalSecrets = [],
  onDelete = jest.fn(),
}: {
  associatedExternalSecrets?: ExternalSecretAssociatedServiceResponse[]
  onDelete?: jest.Mock
} = {}) => {
  useSecretManagerAssociatedServicesMockSpy.mockReturnValue({
    data: associatedExternalSecrets,
    isLoading: false,
  })

  return {
    onDelete,
    ...renderWithProviders(
      <SecretManagerList
        secretManagers={[secretManager]}
        onEdit={jest.fn()}
        onDelete={onDelete}
        onViewAssociatedExternalSecrets={jest.fn()}
      />
    ),
  }
}

describe('SecretManagerList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should disable delete when associated external secrets exist', async () => {
    const { userEvent, onDelete } = renderSecretManagerList({
      associatedExternalSecrets: [{ variable_name: 'DATABASE_URL' } as ExternalSecretAssociatedServiceResponse],
    })

    const deleteButton = screen.getByRole('button', { name: 'Delete secret manager' })

    expect(deleteButton).toBeDisabled()

    await userEvent.hover(deleteButton.parentElement as HTMLElement)

    expect(
      await screen.findByRole('tooltip', {
        name: 'This secret manager is used by external secrets. Remove the associated external secrets before deleting it.',
      })
    ).toBeInTheDocument()

    await userEvent.click(deleteButton)

    expect(onDelete).not.toHaveBeenCalled()
  })

  it('should allow delete when no associated external secrets exist', async () => {
    const { userEvent, onDelete } = renderSecretManagerList()

    const deleteButton = screen.getByRole('button', { name: 'Delete secret manager' })

    expect(deleteButton).toBeEnabled()

    await userEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(secretManager)
  })
})
