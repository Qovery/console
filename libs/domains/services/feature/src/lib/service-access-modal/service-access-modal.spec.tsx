import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import ServiceAccessModal, { type ServiceAccessModalProps } from './service-access-modal'

const props: ServiceAccessModalProps = {
  organizationId: '1',
  projectId: '1',
  service: applicationFactoryMock(1)[0],
}

describe('ServiceAccessModal', () => {
  it('should match snapshot', async () => {
    const { container } = renderWithProviders(<ServiceAccessModal {...props} />)
    expect(container).toMatchSnapshot()
  })
})
