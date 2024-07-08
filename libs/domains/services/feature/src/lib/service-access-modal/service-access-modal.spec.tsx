import { renderWithProviders } from '@qovery/shared/util-tests'
import ServiceAccessModal, { type ServiceAccessModalProps } from './service-access-modal'

const props: ServiceAccessModalProps = {
  serviceType: 'APPLICATION',
}

describe('ServiceAccessModal', () => {
  it('should match snapshot', async () => {
    const { container } = renderWithProviders(<ServiceAccessModal {...props} />)
    expect(container).toMatchSnapshot()
  })
})
