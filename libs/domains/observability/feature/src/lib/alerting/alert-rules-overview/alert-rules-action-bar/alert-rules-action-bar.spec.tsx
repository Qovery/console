import { type AlertRuleResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useDeleteAlertRule from '../../../hooks/use-delete-alert-rule/use-delete-alert-rule'
import { AlertRulesActionBar } from './alert-rules-action-bar'

const mockUseDeleteAlertRule = jest.spyOn(useDeleteAlertRule, 'useDeleteAlertRule') as jest.Mock

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

describe('AlertRulesActionBar', () => {
  const mockDeleteAlertRule = jest.fn()
  const mockResetRowSelection = jest.fn()

  const defaultProps = {
    selectedAlertRules: [],
    resetRowSelection: mockResetRowSelection,
    organizationId: 'org-123',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDeleteAlertRule.mockReturnValue({
      mutate: mockDeleteAlertRule,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<AlertRulesActionBar {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should be hidden when no alert rules are selected', () => {
    renderWithProviders(<AlertRulesActionBar {...defaultProps} />)

    const actionBar = document.querySelector('.animate-action-bar-fade-out')
    expect(actionBar).toBeInTheDocument()
  })

  it('should be visible when alert rules are selected', () => {
    const selectedRules = [
      {
        id: 'rule-1',
        name: 'Test Rule',
        source: 'MANAGED',
      },
    ] as unknown as AlertRuleResponse[]

    renderWithProviders(<AlertRulesActionBar {...defaultProps} selectedAlertRules={selectedRules} />)

    expect(screen.getByText('1 selected alert')).toBeInTheDocument()
  })

  it('should display correct count for multiple selected alert rules', () => {
    const selectedRules = [
      { id: 'rule-1', name: 'Rule 1', source: 'MANAGED' },
      { id: 'rule-2', name: 'Rule 2', source: 'MANAGED' },
    ] as unknown as AlertRuleResponse[]

    renderWithProviders(<AlertRulesActionBar {...defaultProps} selectedAlertRules={selectedRules} />)

    expect(screen.getByText('2 selected alerts')).toBeInTheDocument()
  })

  it('should call resetRowSelection when unselect button is clicked', async () => {
    const selectedRules = [{ id: 'rule-1', name: 'Rule 1', source: 'MANAGED' }] as unknown as AlertRuleResponse[]

    const { userEvent } = renderWithProviders(
      <AlertRulesActionBar {...defaultProps} selectedAlertRules={selectedRules} />
    )

    const unselectButton = screen.getByText('Unselect')
    await userEvent.click(unselectButton)

    expect(mockResetRowSelection).toHaveBeenCalled()
  })

  it('should call openModal when clone button is clicked', async () => {
    const selectedRules = [{ id: 'rule-1', name: 'Rule 1', source: 'MANAGED' }] as unknown as AlertRuleResponse[]

    const { userEvent } = renderWithProviders(
      <AlertRulesActionBar {...defaultProps} selectedAlertRules={selectedRules} />
    )

    const cloneButton = screen.getByText('Clone')
    await userEvent.click(cloneButton)

    expect(mockOpenModal).toHaveBeenCalled()
  })

  it('should call openModalConfirmation when delete button is clicked', async () => {
    const selectedRules = [{ id: 'rule-1', name: 'Rule 1', source: 'MANAGED' }] as unknown as AlertRuleResponse[]

    const { userEvent } = renderWithProviders(
      <AlertRulesActionBar {...defaultProps} selectedAlertRules={selectedRules} />
    )

    const deleteButton = screen.getByText('Delete')
    await userEvent.click(deleteButton)

    expect(mockOpenModalConfirmation).toHaveBeenCalled()
  })

  it('should disable delete button when no deletable alert rules are selected', () => {
    const selectedRules = [{ id: 'rule-1', name: 'Rule 1', source: 'TERRAFORM' }] as unknown as AlertRuleResponse[]

    renderWithProviders(<AlertRulesActionBar {...defaultProps} selectedAlertRules={selectedRules} />)

    const deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeDisabled()
  })

  it('should enable delete button when deletable alert rules are selected', () => {
    const selectedRules = [{ id: 'rule-1', name: 'Rule 1', source: 'MANAGED' }] as unknown as AlertRuleResponse[]

    renderWithProviders(<AlertRulesActionBar {...defaultProps} selectedAlertRules={selectedRules} />)

    const deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeEnabled()
  })
})
