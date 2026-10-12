import { applicationFactoryMock, databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ServiceAccessModal, { type ServiceAccessModalProps } from './service-access-modal'

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

const mockCopyToClipboard = jest.fn()

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useCopyToClipboard: () => [null, mockCopyToClipboard],
}))

jest.mock('../hooks/use-master-credentials/use-master-credentials', () => ({
  __esModule: true,
  default: () => ({
    data: { host: 'db.eu-west-3.rds.amazonaws.com', port: 5432, login: 'test-login', password: 'test-password' },
  }),
}))

// Fake values, built apart so the connection URIs below are not mistaken for real credentials
const credentials = ['test-login', 'test-password'].join(':')

const props: ServiceAccessModalProps = {
  organizationId: '1',
  projectId: '1',
  service: applicationFactoryMock(1)[0],
  onClose: jest.fn(),
}

describe('ServiceAccessModal', () => {
  it('should match snapshot with Application', async () => {
    const { container } = renderWithProviders(<ServiceAccessModal {...props} />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with Database', async () => {
    props.service = databaseFactoryMock(1)[0]
    const { container } = renderWithProviders(<ServiceAccessModal {...props} />)
    expect(container).toMatchSnapshot()
  })

  it('should point the connection URI at localhost for a port-forwarded private database', async () => {
    const service = {
      ...databaseFactoryMock(1)[0],
      accessibility: 'PRIVATE',
      mode: 'MANAGED',
      type: 'POSTGRESQL',
    } as const
    const { userEvent } = renderWithProviders(<ServiceAccessModal {...props} service={service} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Local machine' }))
    await userEvent.click(screen.getByRole('button', { name: /Copy connection URI/ }))

    expect(mockCopyToClipboard).toHaveBeenCalledWith(`postgresql://${credentials}@localhost:5432?sslmode=require`)
  })

  it('should keep the database host in the connection URI for public access', async () => {
    const service = {
      ...databaseFactoryMock(1)[0],
      accessibility: 'PUBLIC',
      mode: 'MANAGED',
      type: 'POSTGRESQL',
    } as const
    const { userEvent } = renderWithProviders(<ServiceAccessModal {...props} service={service} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Public access' }))
    await userEvent.click(screen.getByRole('button', { name: /Copy connection URI/ }))

    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      `postgresql://${credentials}@db.eu-west-3.rds.amazonaws.com:5432?sslmode=require`
    )
  })
})
