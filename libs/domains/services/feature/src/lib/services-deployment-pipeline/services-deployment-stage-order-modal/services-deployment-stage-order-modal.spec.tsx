import { type ReactNode } from 'react'
import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ServicesDeploymentStageOrderModal } from './services-deployment-stage-order-modal'

const mockMoveDeploymentStage = jest.fn()

jest.mock('../../hooks/use-move-deployment-stage/use-move-deployment-stage', () => ({
  useMoveDeploymentStage: () => ({
    mutateAsync: mockMoveDeploymentStage,
  }),
}))

jest.mock('framer-motion', () => ({
  Reorder: {
    Group: ({
      children,
      values,
      onReorder,
    }: {
      children: ReactNode
      values: { id: string }[]
      onReorder: (values: { id: string }[]) => void
    }) => (
      <div role="list">
        <button type="button" onClick={() => onReorder([values[1], values[0], ...values.slice(2)])}>
          Reorder stages
        </button>
        {children}
      </div>
    ),
    Item: ({ children, onDragEnd }: { children: ReactNode; onDragEnd: () => void }) => (
      <div role="listitem">
        {children}
        <button type="button" onClick={() => onDragEnd()}>
          Commit reorder
        </button>
      </div>
    ),
  },
}))

describe('ServicesDeploymentStageOrderModal', () => {
  const stages = deploymentStagesFactoryMock(3).map((stage, index) => ({
    ...stage,
    id: `stage-${index + 1}`,
    name: `Stage ${index + 1}`,
    deployment_order: index + 1,
  }))
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockMoveDeploymentStage.mockResolvedValue([stages[1], stages[0], stages[2]])
  })

  it('renders the stages in order', () => {
    renderWithProviders(<ServicesDeploymentStageOrderModal onClose={onClose} stages={stages} />)

    expect(screen.getByText('Stage 1')).toBeInTheDocument()
    expect(screen.getByText('Stage 2')).toBeInTheDocument()
    expect(screen.getByText('Stage 3')).toBeInTheDocument()
  })

  it('closes when cancel is clicked', async () => {
    const { userEvent } = renderWithProviders(<ServicesDeploymentStageOrderModal onClose={onClose} stages={stages} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('submits a reorder and rehydrates with the returned stages', async () => {
    const { userEvent } = renderWithProviders(<ServicesDeploymentStageOrderModal onClose={onClose} stages={stages} />)

    await userEvent.click(screen.getByRole('button', { name: 'Reorder stages' }))
    await userEvent.click(screen.getAllByRole('button', { name: 'Commit reorder' })[0])

    await waitFor(() => {
      expect(mockMoveDeploymentStage).toHaveBeenCalledWith({
        stageId: 'stage-1',
        targetStageId: 'stage-2',
        after: true,
      })
    })

    const items = screen.getAllByRole('listitem').map((item) => item.textContent)
    expect(items[0]).toContain('Stage 2')
    expect(items[1]).toContain('Stage 1')
  })
})
