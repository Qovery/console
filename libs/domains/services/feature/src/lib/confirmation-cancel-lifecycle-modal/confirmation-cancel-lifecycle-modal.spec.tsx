import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useCancelDeploymentService } from '../hooks/use-cancel-deployment-service/use-cancel-deployment-service'
import ConfirmationCancelLifecycleModal, {
  type ConfirmationCancelLifecycleModalProps,
} from './confirmation-cancel-lifecycle-modal'

jest.mock('../hooks/use-cancel-deployment-service/use-cancel-deployment-service', () => {
  const mutate = jest.fn()
  return {
    ...jest.requireActual('../hooks/use-cancel-deployment-service/use-cancel-deployment-service'),
    useCancelDeploymentService: () => ({
      mutate,
    }),
  }
})

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
    const { userEvent } = renderWithProviders(<ConfirmationCancelLifecycleModal {...props} />)

    const checkbox = screen.getByLabelText(/force lifecycle/i)
    await userEvent.click(checkbox)

    const submitButton = screen.getByRole('button', { name: /confirm/i })
    await userEvent.click(submitButton)

    expect(useCancelDeploymentService({ projectId: '' }).mutate).toHaveBeenCalledWith({
      environmentId: '1',
      force: true,
    })
  })
})
