import { CustomDomainStatusEnum } from 'qovery-typescript-axios'
import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CrudModalFeature, { type CrudModalFeatureProps } from './crud-modal-feature'

const mockMutateEditCustomDomain = jest.fn()
const mockMutateCreateCustomDomain = jest.fn()

jest.mock('@qovery/domains/custom-domains/feature', () => ({
  useEditCustomDomain: () => ({
    mutateAsync: mockMutateEditCustomDomain,
  }),
  useCreateCustomDomain: () => ({
    mutateAsync: mockMutateCreateCustomDomain,
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useLinks: () => ({
    data: [],
  }),
  useDeploymentStatus: () => ({
    data: {
      execution_id: 'exec-1',
    },
  }),
}))

const props: CrudModalFeatureProps = {
  customDomain: {
    id: '1',
    domain: 'example.com',
    status: CustomDomainStatusEnum.VALIDATION_PENDING,
    validation_domain: 'example.com',
    updated_at: '2020-01-01T00:00:00Z',
    created_at: '2020-01-01T00:00:00Z',
    generate_certificate: true,
    use_cdn: false,
  },
  service: applicationFactoryMock(1)[0] as Application,
  onClose: jest.fn(),
}

describe('CrudModalFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should create a custom domain', async () => {
    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} customDomain={undefined} />)

    const input = screen.getByLabelText('Domain')
    await userEvent.type(input, 'example.com')

    const button = screen.getByRole('button', { name: 'Create' })
    await userEvent.click(button)

    expect(mockMutateCreateCustomDomain).toHaveBeenCalledWith({
      serviceId: '0',
      serviceType: 'APPLICATION',
      payload: {
        domain: 'example.com',
        generate_certificate: true,
        use_cdn: false,
      },
    })
  })

  it('should edit a custom domain', async () => {
    props.customDomain = {
      id: '1',
      domain: 'example.com',
      status: 'VALIDATION_PENDING',
      validation_domain: 'example.com',
      updated_at: '2020-01-01T00:00:00Z',
      created_at: '2020-01-01T00:00:00Z',
      generate_certificate: false,
      use_cdn: false,
    }

    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    const input = screen.getByLabelText('Domain')
    await userEvent.clear(input)
    await userEvent.type(input, 'example.com')

    const button = screen.getByRole('button', { name: 'Confirm' })
    await userEvent.click(button)

    expect(mockMutateEditCustomDomain).toHaveBeenCalledWith({
      serviceId: '0',
      customDomainId: '1',
      serviceType: 'APPLICATION',
      payload: {
        domain: 'example.com',
        generate_certificate: false,
        use_cdn: false,
      },
    })
  })
})
