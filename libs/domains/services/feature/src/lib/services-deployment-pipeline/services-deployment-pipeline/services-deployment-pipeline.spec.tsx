import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { applicationFactoryMock, databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { SKIPPED_STAGE_ID, ServicesDeploymentPipeline } from './services-deployment-pipeline'

const mockAttachServiceToDeploymentStage = jest.fn()
const mockDeleteDeploymentStage = jest.fn()
const mockOpenModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()

const applicationService = {
  ...applicationFactoryMock(1)[0],
  id: 'app-1',
  name: 'API service',
}

const skippedService = {
  ...applicationFactoryMock(1)[0],
  id: 'app-2',
  name: 'Skipped service',
}

const databaseService = {
  ...databaseFactoryMock(1)[0],
  id: 'db-1',
  name: 'Orders DB',
}

let mockServices = [applicationService, databaseService]
let mockIsServicesLoading = false
let mockDeploymentStages: DeploymentStageResponse[] = [
  {
    id: 'stage-1',
    created_at: '',
    environment: { id: 'env-1' },
    name: 'Build',
    description: 'Compile and package',
    deployment_order: 1,
    services: [{ id: 'stage-service-1', created_at: '', service_id: 'app-1', service_type: 'APPLICATION' }],
  },
  {
    id: 'stage-2',
    created_at: '',
    environment: { id: 'env-1' },
    name: 'Deploy',
    description: 'Deploy workloads',
    deployment_order: 2,
    services: [{ id: 'stage-service-2', created_at: '', service_id: 'db-1', service_type: 'DATABASE' }],
  },
]
let mockIsDeploymentStagesLoading = false

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    environmentId: 'env-1',
  }),
}))

jest.mock('../../hooks/use-list-deployment-stages/use-list-deployment-stages', () => ({
  useListDeploymentStages: () => ({
    data: mockDeploymentStages,
    isLoading: mockIsDeploymentStagesLoading,
  }),
}))

jest.mock('../../hooks/use-services/use-services', () => ({
  useServices: () => ({
    data: mockServices,
    isLoading: mockIsServicesLoading,
  }),
}))

jest.mock('../../hooks/use-attach-service-to-deployment-stage/use-attach-service-to-deployment-stage', () => ({
  useAttachServiceToDeploymentStage: () => ({
    mutate: mockAttachServiceToDeploymentStage,
  }),
}))

jest.mock('../../hooks/use-delete-deployment-stage/use-delete-deployment-stage', () => ({
  useDeleteDeploymentStage: () => ({
    mutate: mockDeleteDeploymentStage,
  }),
}))

jest.mock('../services-deployment-stage-modal/services-deployment-stage-modal', () => ({
  ServicesDeploymentStageModal: () => <div>stage-modal</div>,
}))

jest.mock('../services-deployment-stage-order-modal/services-deployment-stage-order-modal', () => ({
  ServicesDeploymentStageOrderModal: () => <div>stage-order-modal</div>,
}))

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')

  return {
    ...actual,
    LoaderSpinner: () => <div role="status">loading</div>,
    Board: {
      Root: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      Column: ({
        heading,
        children,
        columnId,
        data,
        setData,
      }: {
        heading: ReactNode
        children: ReactNode
        columnId: string
        data: { cardId: string; columnId: string }[]
        setData: (value: {
          sourceColumnId: string
          sourceCardId?: string
          targetColumnId: string
          newData: { cardId: string; columnId: string }[]
        }) => void
      }) => (
        <section aria-label={`column-${columnId}`}>
          <div>{heading}</div>
          {data
            .filter(({ columnId: currentColumnId }) => currentColumnId !== columnId)
            .map((card) => (
              <button
                key={`${card.cardId}-${columnId}`}
                type="button"
                onClick={() =>
                  setData({
                    sourceColumnId: card.columnId,
                    sourceCardId: card.cardId,
                    targetColumnId: columnId,
                    newData: data.map((currentCard) =>
                      currentCard.cardId === card.cardId ? { ...currentCard, columnId } : currentCard
                    ),
                  })
                }
              >
                {`Move ${card.cardId} to ${columnId}`}
              </button>
            ))}
          {children}
        </section>
      ),
      Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    },
    useModal: () => ({
      openModal: mockOpenModal,
      closeModal: jest.fn(),
    }),
    useModalConfirmation: () => ({
      openModalConfirmation: mockOpenModalConfirmation,
    }),
  }
})

describe('ServicesDeploymentPipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockServices = [applicationService, databaseService]
    mockIsServicesLoading = false
    mockDeploymentStages = [
      {
        id: 'stage-1',
        created_at: '',
        environment: { id: 'env-1' },
        name: 'Build',
        description: 'Compile and package',
        deployment_order: 1,
        services: [{ id: 'stage-service-1', created_at: '', service_id: 'app-1', service_type: 'APPLICATION' }],
      },
      {
        id: 'stage-2',
        created_at: '',
        environment: { id: 'env-1' },
        name: 'Deploy',
        description: 'Deploy workloads',
        deployment_order: 2,
        services: [{ id: 'stage-service-2', created_at: '', service_id: 'db-1', service_type: 'DATABASE' }],
      },
    ]
    mockIsDeploymentStagesLoading = false
  })

  it('renders stages, services, and database subtitle', () => {
    renderWithProviders(<ServicesDeploymentPipeline />)

    expect(screen.getByRole('heading', { level: 1, name: 'Pipeline' })).toBeInTheDocument()
    expect(screen.getByText('Build')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
    expect(screen.getByText('API service')).toBeInTheDocument()
    expect(screen.getByText('Orders DB')).toBeInTheDocument()
    expect(screen.getByText('Postgresql - Container')).toBeInTheDocument()
  })

  it('shows a loader while data is loading', () => {
    mockIsServicesLoading = true

    renderWithProviders(<ServicesDeploymentPipeline />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders the virtual skipped stage', () => {
    mockServices = [applicationService, databaseService, skippedService]
    mockDeploymentStages = [
      {
        id: 'stage-1',
        created_at: '',
        environment: { id: 'env-1' },
        name: 'Build',
        description: 'Compile and package',
        deployment_order: 1,
        services: [
          { id: 'stage-service-1', created_at: '', service_id: 'app-1', service_type: 'APPLICATION' },
          {
            id: 'stage-service-3',
            created_at: '',
            service_id: 'app-2',
            service_type: 'APPLICATION',
            is_skipped: true,
          },
        ],
      },
    ]

    renderWithProviders(<ServicesDeploymentPipeline />)

    expect(screen.getByText('Skipped')).toBeInTheDocument()
    expect(screen.getByText('Skipped service')).toBeInTheDocument()
  })

  it('opens the add stage modal', async () => {
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.click(screen.getByRole('button', { name: /add stage/i }))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
  })

  it('opens the delete confirmation for an empty stage', async () => {
    mockDeploymentStages[0].services = []
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.click(screen.getByRole('button', { name: 'Stage actions for Build' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete stage' }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledTimes(1)

    mockOpenModalConfirmation.mock.calls[0][0].action()

    expect(mockDeleteDeploymentStage).toHaveBeenCalledWith({ stageId: 'stage-1' })
  })

  it.each([1, 2])('shows a stage with %i skipped services as occupied and prevents deletion', async (count) => {
    mockServices = Array.from({ length: count }, (_, index) => ({ ...skippedService, id: `app-skipped-${index}` }))
    mockDeploymentStages[0].services = Array.from({ length: count }, (_, index) => ({
      id: `skipped-${index}`,
      created_at: '',
      service_id: `app-skipped-${index}`,
      service_type: 'APPLICATION',
      is_skipped: true,
    }))

    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)
    const stage = within(screen.getByRole('region', { name: 'column-stage-1' }))

    expect(stage.getByText(new RegExp(`${count} skipped`))).toHaveTextContent('shown in the Skipped column')
    expect(stage.queryByText(/No service for this stage/)).not.toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: `column-${SKIPPED_STAGE_ID}` })).getAllByText('Skipped service')
    ).toHaveLength(count)

    await userEvent.click(stage.getByRole('button', { name: 'Stage actions for Build' }))
    const deleteAction = screen.getByRole('menuitem', { name: 'Delete stage' })
    expect(deleteAction).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(deleteAction)
    expect(mockOpenModalConfirmation).not.toHaveBeenCalled()
    expect(mockDeleteDeploymentStage).not.toHaveBeenCalled()
  })

  it('shows skipped membership alongside the active services in their stage', () => {
    mockServices = [applicationService, databaseService, skippedService]
    mockDeploymentStages[0].services?.push({
      id: 'skipped-1',
      created_at: '',
      service_id: 'app-2',
      service_type: 'APPLICATION',
      is_skipped: true,
    })

    renderWithProviders(<ServicesDeploymentPipeline />)
    const stage = within(screen.getByRole('region', { name: 'column-stage-1' }))

    expect(stage.getByText('API service')).toBeInTheDocument()
    expect(stage.getByText(/1 skipped service belongs to this stage/)).toBeInTheDocument()
    expect(stage.queryByText('Skipped service')).not.toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'column-stage-2' })).queryByText(/skipped service belongs/)
    ).not.toBeInTheDocument()
  })

  it('prevents deleting a stage containing a non-skipped service', async () => {
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.click(screen.getByRole('button', { name: 'Stage actions for Build' }))

    expect(screen.getByRole('menuitem', { name: 'Delete stage' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('opens the order modal from the stage actions', async () => {
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.click(screen.getByRole('button', { name: 'Stage actions for Build' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit order' }))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
  })

  it('moves a service to the skipped virtual stage', async () => {
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.click(screen.getByRole('button', { name: `Move stage-service-1 to ${SKIPPED_STAGE_ID}` }))

    await waitFor(() => {
      expect(mockAttachServiceToDeploymentStage).toHaveBeenCalledWith({
        stageId: 'stage-1',
        serviceId: 'app-1',
        isSkipped: true,
        prevStage: {
          stageId: 'stage-1',
          serviceId: 'app-1',
        },
      })
    })
  })

  it('moves a service to another stage', async () => {
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.click(screen.getByRole('button', { name: 'Move stage-service-1 to stage-2' }))

    await waitFor(() => {
      expect(mockAttachServiceToDeploymentStage).toHaveBeenCalledWith({
        stageId: 'stage-2',
        serviceId: 'app-1',
        isSkipped: false,
        prevStage: {
          stageId: 'stage-1',
          serviceId: 'app-1',
        },
      })
    })
  })
})
