import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ServiceDomainCrudModal, type ServiceDomainCrudModalProps } from './service-domain-crud-modal'

const mockMutateCreateCustomDomain = jest.fn().mockResolvedValue(undefined)
const mockMutateEditCustomDomain = jest.fn().mockResolvedValue(undefined)
const mockEnableAlertClickOutside = jest.fn()

jest.mock('@qovery/domains/custom-domains/feature', () => ({
  useCreateCustomDomain: () => ({
    mutateAsync: mockMutateCreateCustomDomain,
    isLoading: false,
  }),
  useEditCustomDomain: () => ({
    mutateAsync: mockMutateEditCustomDomain,
    isLoading: false,
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useLinks: () => ({
    data: [
      {
        url: 'https://default.qovery.example',
        is_qovery_domain: true,
        is_default: true,
      },
    ],
  }),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    enableAlertClickOutside: mockEnableAlertClickOutside,
  }),
}))

const service = applicationFactoryMock(1)[0] as Application

const props: ServiceDomainCrudModalProps = {
  organizationId: 'org-1',
  projectId: 'project-1',
  service,
  onClose: jest.fn(),
}

describe('ServiceDomainCrudModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders successfully and shows the CNAME target', () => {
    renderWithProviders(<ServiceDomainCrudModal {...props} />)

    expect(screen.getByText('CNAME configuration')).toBeInTheDocument()
    expect(screen.getByText('default.qovery.example')).toBeInTheDocument()
  })

  it('creates a custom domain', async () => {
    const { userEvent } = renderWithProviders(<ServiceDomainCrudModal {...props} />)

    await userEvent.type(screen.getByLabelText('Domain'), 'example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(mockMutateCreateCustomDomain).toHaveBeenCalledWith({
        serviceId: service.id,
        serviceType: 'APPLICATION',
        payload: {
          domain: 'example.com',
          generate_certificate: true,
          use_cdn: false,
        },
      })
    })
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('edits a custom domain', async () => {
    const { userEvent } = renderWithProviders(
      <ServiceDomainCrudModal
        {...props}
        customDomain={{
          id: '1',
          domain: 'example.com',
          status: 'VALIDATION_PENDING',
          validation_domain: 'validation.example.com',
          updated_at: '2020-01-01T00:00:00Z',
          created_at: '2020-01-01T00:00:00Z',
          generate_certificate: false,
          use_cdn: false,
        }}
      />
    )

    await userEvent.clear(screen.getByLabelText('Domain'))
    await userEvent.type(screen.getByLabelText('Domain'), 'edited-example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(mockMutateEditCustomDomain).toHaveBeenCalledWith({
        serviceId: service.id,
        serviceType: 'APPLICATION',
        customDomainId: '1',
        payload: {
          domain: 'edited-example.com',
          generate_certificate: false,
          use_cdn: false,
        },
      })
    })
  })

  it('disables certificate generation when CDN is enabled', async () => {
    const { userEvent } = renderWithProviders(<ServiceDomainCrudModal {...props} />)

    await userEvent.type(screen.getByLabelText('Domain'), 'example.com')
    await userEvent.click(screen.getByText('Domain behind a CDN or DNS proxy (e.g. Cloudflare, CloudFront, Route 53)'))
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(mockMutateCreateCustomDomain).toHaveBeenCalledWith({
        serviceId: service.id,
        serviceType: 'APPLICATION',
        payload: {
          domain: 'example.com',
          generate_certificate: false,
          use_cdn: true,
        },
      })
    })
  })
})
