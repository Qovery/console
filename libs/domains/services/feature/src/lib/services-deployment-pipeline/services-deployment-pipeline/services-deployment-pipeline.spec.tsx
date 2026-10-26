import { AxiosHeaders } from 'axios'
import { DeploymentStageMainCallsApi, type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { mutations } from '@qovery/domains/environments/data-access'
import { applicationFactoryMock, databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { ServicesDeploymentPipeline } from './services-deployment-pipeline'

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

  it('keeps skipped services in their actual stage with an icon', () => {
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

    expect(screen.getByRole('img', { name: 'Skipped in environment-level deployments' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'column-stage-1' })).getByText('Skipped service')
    ).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'column-__VIRTUAL_SKIPPED__' })).not.toBeInTheDocument()
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

    expect(stage.getAllByRole('img', { name: 'Skipped in environment-level deployments' })).toHaveLength(count)
    expect(stage.queryByText(/No service for this stage/)).not.toBeInTheDocument()
    expect(stage.getAllByText('Skipped service')).toHaveLength(count)

    await userEvent.click(stage.getByRole('button', { name: 'Stage actions for Build' }))
    const deleteAction = screen.getByRole('menuitem', { name: 'Delete stage' })
    expect(deleteAction).toHaveAttribute('aria-disabled', 'true')
    await userEvent.hover(deleteAction)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Move all services, including skipped services, to another stage before deleting this stage'
    )
    await userEvent.click(deleteAction)
    expect(mockOpenModalConfirmation).not.toHaveBeenCalled()
    expect(mockDeleteDeploymentStage).not.toHaveBeenCalled()
  })

  it('explains blocked deletion from keyboard focus and prevents Enter and Space activation', async () => {
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Stage actions for Build' })).toHaveFocus()
    await userEvent.keyboard('[Enter][End]')

    expect(screen.getByRole('menuitem', { name: 'Delete stage' })).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Move all services, including skipped services, to another stage before deleting this stage'
    )
    await userEvent.keyboard('[Enter][Space]')
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
    expect(stage.getByRole('img', { name: 'Skipped in environment-level deployments' })).toBeInTheDocument()
    expect(stage.getByText('Skipped service')).toBeInTheDocument()
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

  it('restores the original stage when a move fails', async () => {
    mockAttachServiceToDeploymentStage.mockImplementationOnce((_request, options) => options.onError())
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.click(screen.getByRole('button', { name: 'Move stage-service-1 to stage-2' }))

    expect(within(screen.getByRole('region', { name: 'column-stage-1' })).getByText('API service')).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'column-stage-2' })).queryByText('API service')
    ).not.toBeInTheDocument()
  })

  it.each([false, true])('toggles deployment inclusion for a service with is_skipped=%s', async (isSkipped) => {
    mockDeploymentStages[0].services = [
      {
        id: 'stage-service-1',
        created_at: '',
        service_id: 'app-1',
        service_type: 'APPLICATION',
        is_skipped: isSkipped,
      },
    ]
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.click(screen.getByRole('button', { name: 'Deployment options for API service' }))
    await userEvent.click(
      screen.getByRole('menuitem', { name: isSkipped ? 'Include in deployments' : 'Skip in deployments' })
    )

    expect(mockAttachServiceToDeploymentStage).toHaveBeenCalledWith({
      stageId: 'stage-1',
      serviceId: 'app-1',
      isSkipped: !isSkipped,
      prevStage: { stageId: 'stage-1', serviceId: 'app-1', isSkipped },
    })
  })

  it.each([false, true])('preserves is_skipped=%s when moving a service to another stage', async (isSkipped) => {
    mockDeploymentStages[0].services = [
      {
        id: 'stage-service-1',
        created_at: '',
        service_id: 'app-1',
        service_type: 'APPLICATION',
        is_skipped: isSkipped,
      },
    ]
    const { userEvent } = renderWithProviders(<ServicesDeploymentPipeline />)

    await userEvent.click(screen.getByRole('button', { name: 'Move stage-service-1 to stage-2' }))

    expect(mockAttachServiceToDeploymentStage).toHaveBeenCalledWith(
      {
        stageId: 'stage-2',
        serviceId: 'app-1',
        isSkipped,
        prevStage: { stageId: 'stage-1', serviceId: 'app-1', isSkipped },
      },
      expect.objectContaining({ onError: expect.any(Function) })
    )
    expect(within(screen.getByRole('region', { name: 'column-stage-2' })).getByText('API service')).toBeInTheDocument()
  })
})

describe('deployment stage attachment requests', () => {
  const response: Awaited<ReturnType<DeploymentStageMainCallsApi['attachServiceToDeploymentStage']>> = {
    data: { results: [] },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  }
  let attach: jest.SpyInstance

  beforeEach(() => {
    attach = jest
      .spyOn(DeploymentStageMainCallsApi.prototype, 'attachServiceToDeploymentStage')
      .mockResolvedValue(response)
  })

  afterEach(() => jest.restoreAllMocks())

  it('moves a skipped service before restoring its skipped status', async () => {
    await mutations.attachServiceToDeploymentStage({
      stageId: 'target',
      serviceId: 'service',
      isSkipped: true,
      prevStage: { stageId: 'source', serviceId: 'service', isSkipped: true },
    })
    expect(attach).toHaveBeenCalledTimes(2)
    expect(attach).toHaveBeenNthCalledWith(1, 'target', 'service')
    expect(attach).toHaveBeenNthCalledWith(2, 'target', 'service', { is_skipped: true })
  })

  it('toggles skipping in the same stage with one request', async () => {
    await mutations.attachServiceToDeploymentStage({
      stageId: 'source',
      serviceId: 'service',
      isSkipped: true,
      prevStage: { stageId: 'source', serviceId: 'service', isSkipped: false },
    })
    expect(attach).toHaveBeenCalledTimes(1)
    expect(attach).toHaveBeenCalledWith('source', 'service', { is_skipped: true })
  })

  it('only skips when there is no known cross-stage move', async () => {
    await mutations.attachServiceToDeploymentStage({ stageId: 'source', serviceId: 'service', isSkipped: true })
    expect(attach).toHaveBeenCalledTimes(1)
    expect(attach).toHaveBeenCalledWith('source', 'service', { is_skipped: true })
  })

  it('restores stage membership and skipped status when undoing a move', async () => {
    await mutations.attachServiceToDeploymentStage({
      stageId: 'source',
      serviceId: 'service',
      isSkipped: true,
      prevStage: { stageId: 'target', serviceId: 'service', isSkipped: true },
    })
    expect(attach).toHaveBeenNthCalledWith(1, 'source', 'service')
    expect(attach).toHaveBeenNthCalledWith(2, 'source', 'service', { is_skipped: true })
  })

  it('does not skip the service if moving it fails', async () => {
    attach.mockRejectedValueOnce(new Error('Move failed'))
    await expect(
      mutations.attachServiceToDeploymentStage({
        stageId: 'target',
        serviceId: 'service',
        isSkipped: true,
        prevStage: { stageId: 'source', serviceId: 'service', isSkipped: true },
      })
    ).rejects.toThrow('Move failed')
    expect(attach).toHaveBeenCalledTimes(1)
  })

  it('reports a failure when restoring the skipped status fails', async () => {
    attach.mockResolvedValueOnce(response).mockRejectedValueOnce(new Error('Skip failed'))
    await expect(
      mutations.attachServiceToDeploymentStage({
        stageId: 'target',
        serviceId: 'service',
        isSkipped: true,
        prevStage: { stageId: 'source', serviceId: 'service', isSkipped: true },
      })
    ).rejects.toThrow('Skip failed')
    expect(attach).toHaveBeenCalledTimes(2)
  })
})
