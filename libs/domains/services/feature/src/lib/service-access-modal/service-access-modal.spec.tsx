import { applicationFactoryMock, databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import useMasterCredentials from '../hooks/use-master-credentials/use-master-credentials'
import ServiceAccessModal, { type ServiceAccessModalProps } from './service-access-modal'

const mockCopyToClipboard = jest.fn()

jest.mock('../hooks/use-master-credentials/use-master-credentials')

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useCopyToClipboard: () => [null, mockCopyToClipboard],
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  useVariables: () => ({
    data: [
      {
        id: 'c0277184-1fe0-4f17-b09a-58eee2c05701',
        created_at: '2023-10-25T09:13:34.723567Z',
        updated_at: '2023-10-25T09:13:34.723568Z',
        key: 'QOVERY_CONTAINER_Z04308DE2_HOST_INTERNAL',
        value: 'app-z04308de2-back-end',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '04308de2-af27-405f-9e95-570fa94ed577',
        service_name: 'back-end-A',
        service_type: 'CONTAINER',
        owned_by: 'QOVERY',
        is_secret: false,
      },
    ],
  }),
}))

const props: ServiceAccessModalProps = {
  organizationId: '1',
  projectId: '1',
  service: applicationFactoryMock(1)[0],
  onClose: jest.fn(),
}

const managedPostgres = (accessibility: 'PRIVATE' | 'PUBLIC') => ({
  ...databaseFactoryMock(1)[0],
  mode: 'MANAGED' as const,
  type: 'POSTGRESQL' as const,
  port: 5432,
  accessibility,
})

describe('ServiceAccessModal', () => {
  beforeEach(() => {
    jest.mocked(useMasterCredentials).mockReturnValue({
      data: { host: 'db.abc.eu-west-3.rds.amazonaws.com', port: 5432, login: 'qoveryadmin', password: 'secret' },
    } as ReturnType<typeof useMasterCredentials>)
  })

  it('should match snapshot with Application', async () => {
    const { container } = renderWithProviders(<ServiceAccessModal {...props} />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with Database', async () => {
    props.service = databaseFactoryMock(1)[0]
    const { container } = renderWithProviders(<ServiceAccessModal {...props} />)
    expect(container).toMatchSnapshot()
  })

  it('should copy a localhost URI on the local machine tab, where the port-forward tunnel listens', async () => {
    const { userEvent } = renderWithProviders(<ServiceAccessModal {...props} service={managedPostgres('PRIVATE')} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Local machine' }))
    await userEvent.click(screen.getByRole('button', { name: /copy connection uri/i }))

    expect(mockCopyToClipboard).toHaveBeenCalledWith('postgresql://qoveryadmin:secret@localhost:5432?sslmode=require')
  })

  it('should warn about TLS hostname verification for redis on the local machine tab', async () => {
    const redis = { ...managedPostgres('PRIVATE'), type: 'REDIS' as const }
    const { userEvent } = renderWithProviders(<ServiceAccessModal {...props} service={redis} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Local machine' }))

    expect(screen.getByText(/disable hostname verification/)).toBeInTheDocument()
  })

  it('should copy the database host on the public access tab', async () => {
    const { userEvent } = renderWithProviders(<ServiceAccessModal {...props} service={managedPostgres('PUBLIC')} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Public access' }))
    await userEvent.click(screen.getByRole('button', { name: /copy connection uri/i }))

    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      'postgresql://qoveryadmin:secret@db.abc.eu-west-3.rds.amazonaws.com:5432?sslmode=require'
    )
  })
})
