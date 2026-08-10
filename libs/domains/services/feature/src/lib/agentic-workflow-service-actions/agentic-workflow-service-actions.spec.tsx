import { type Environment } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowServiceActions } from './agentic-workflow-service-actions'

const mockDeleteService = jest.fn()
const mockNavigate = jest.fn()
const mockOpenModalConfirmation = jest.fn()
const mockCopyToClipboard = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModalConfirmation: () => ({ openModalConfirmation: mockOpenModalConfirmation }),
}))

jest.mock('../hooks/use-delete-service/use-delete-service', () => ({
  useDeleteService: () => ({ mutateAsync: mockDeleteService }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  useCopyToClipboard: () => [undefined, mockCopyToClipboard],
}))

describe('AgenticWorkflowServiceActions', () => {
  const environment = {
    id: 'environment-1',
    cluster_id: 'cluster-1',
    organization: { id: 'organization-1' },
    project: { id: 'project-1' },
  } as Environment
  const service = {
    id: 'workflow-1',
    name: 'Review pull requests',
    service_type: 'AGENTIC_WORKFLOW',
    serviceType: 'AGENTIC_WORKFLOW',
  } as never

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('only exposes metadata and delete actions', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowServiceActions environment={environment} service={service} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Other actions for Review pull requests' }))

    expect(screen.getByRole('menuitem', { name: 'Service metadata' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Redeploy' })).not.toBeInTheDocument()
  })

  it('shows and copies service metadata', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowServiceActions environment={environment} service={service} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Other actions for Review pull requests' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Service metadata' }))

    expect(screen.getByText('Cluster ID')).toBeInTheDocument()
    expect(screen.getByText('Organization ID')).toBeInTheDocument()
    expect(screen.getByText('Project ID')).toBeInTheDocument()
    expect(screen.getByText('Environment ID')).toBeInTheDocument()
    expect(screen.getByText('Service ID')).toBeInTheDocument()

    screen.getByRole('menuitem', { name: /Cluster ID cluster-1/i }).focus()
    await userEvent.keyboard('{Enter}')
    expect(mockCopyToClipboard).toHaveBeenCalledWith('cluster-1')
  })

  it('deletes the workflow and redirects to the environment overview', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowServiceActions environment={environment} service={service} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Other actions for Review pull requests' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Delete Review pull requests?', name: 'Review pull requests' })
    )

    const { action } = mockOpenModalConfirmation.mock.calls[0][0]
    await action()

    expect(mockDeleteService).toHaveBeenCalledWith({
      serviceId: 'workflow-1',
      serviceType: 'AGENTIC_WORKFLOW',
    })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId: 'organization-1',
        projectId: 'project-1',
        environmentId: 'environment-1',
      },
    })
  })
})
