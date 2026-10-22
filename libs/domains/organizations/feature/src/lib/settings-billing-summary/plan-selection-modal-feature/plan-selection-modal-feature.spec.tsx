import { PlanEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useChangePlanHook from '../../hooks/use-change-plan/use-change-plan'
import PlanSelectionModalFeature from './plan-selection-modal-feature'

const useChangePlanSpy = jest.spyOn(useChangePlanHook, 'useChangePlan') as jest.Mock

describe('PlanSelectionModalFeature', () => {
  const mutateAsyncMock = jest.fn()

  beforeEach(() => {
    mutateAsyncMock.mockResolvedValue(undefined)
    useChangePlanSpy.mockReturnValue({ mutateAsync: mutateAsyncMock })
  })

  it('should preselect a selectable current plan and flag it as current', () => {
    renderWithProviders(
      <PlanSelectionModalFeature organizationId="org-1" closeModal={jest.fn()} currentPlan={PlanEnum.GROWTH_2026} />
    )

    const growth = screen.getByRole('radio', { name: new RegExp(PlanEnum.GROWTH_2026) })
    expect(growth).toBeChecked()
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('should not preselect a legacy current plan', () => {
    renderWithProviders(
      <PlanSelectionModalFeature organizationId="org-1" closeModal={jest.fn()} currentPlan={PlanEnum.TEAM_2025} />
    )

    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument()
    expect(screen.queryByText('Current')).not.toBeInTheDocument()
  })

  it('should change the plan and close the modal on submit', async () => {
    const closeModal = jest.fn()
    const { userEvent } = renderWithProviders(
      <PlanSelectionModalFeature organizationId="org-1" closeModal={closeModal} currentPlan={PlanEnum.GROWTH_2026} />
    )

    await userEvent.click(screen.getByRole('radio', { name: new RegExp(PlanEnum.SCALE_2026) }))
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(mutateAsyncMock).toHaveBeenCalledWith({ organizationId: 'org-1', plan: PlanEnum.SCALE_2026 })
    expect(closeModal).toHaveBeenCalled()
  })
})
