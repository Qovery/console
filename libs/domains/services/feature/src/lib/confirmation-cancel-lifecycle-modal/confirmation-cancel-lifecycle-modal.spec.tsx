import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as servicesDomains from '../hooks/use-cancel-deployment-service/use-cancel-deployment-service'
import ConfirmationCancelLifecycleModal, {
  type ConfirmationCancelLifecycleModalProps,
} from './confirmation-cancel-lifecycle-modal'

const useCancelDeploymentServiceMockSpy = jest.spyOn(servicesDomains, 'useCancelDeploymentService') as jest.Mock

const props: ConfirmationCancelLifecycleModalProps = {
  onClose: jest.fn(),
  serviceId: '1',
  organizationId: '0',
  projectId: '1',
  environmentId: '1',
}

describe('ConfirmationCancelLifecycleModal', () => {
  it('should match snapshot', async () => {
    const { container } = renderWithProviders(<ConfirmationCancelLifecycleModal {...props} />)
    expect(container).toMatchSnapshot()
  })

  it('should confirm modal with force checked', async () => {
    useCancelDeploymentServiceMockSpy.mockReturnValue({
      mutate: jest.fn(),
    })

    const { userEvent } = renderWithProviders(<ConfirmationCancelLifecycleModal {...props} />)

    const checkbox = screen.getByLabelText(/force lifecycle/i)
    await userEvent.click(checkbox)

    const submitButton = screen.getByRole('button', { name: /confirm/i })
    await userEvent.click(submitButton)

    expect(useCancelDeploymentServiceMockSpy().mutate).toHaveBeenCalledWith({
      environmentId: '1',
      force: true,
    })
  })
})
