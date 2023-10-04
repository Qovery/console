import { CustomDomainStatusEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import CrudModalFeature, { type CrudModalFeatureProps } from './crud-modal-feature'

const props: CrudModalFeatureProps = {
  organizationId: '0',
  projectId: '1',
  customDomain: {
    id: '1',
    domain: 'example.com',
    status: CustomDomainStatusEnum.VALIDATION_PENDING,
    validation_domain: 'example.com',
    updated_at: '2020-01-01T00:00:00Z',
    created_at: '2020-01-01T00:00:00Z',
    generate_certificate: true,
  },
  application: applicationFactoryMock(1)[0],
  onClose: jest.fn(),
}

describe('CrudModalFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
