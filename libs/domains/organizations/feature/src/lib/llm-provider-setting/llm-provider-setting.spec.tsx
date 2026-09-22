import { act } from '@testing-library/react'
import { type LlmProviderResponse, LlmProviderScope, LlmProviderType } from 'qovery-typescript-axios'
import { type ReactElement } from 'react'
import selectEvent from 'react-select-event'
import * as sharedUi from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type LlmProviderCreateEditModalProps } from '../llm-provider-create-edit-modal/llm-provider-create-edit-modal'
import { LlmProviderSetting } from './llm-provider-setting'

const useModalMock = jest.spyOn(sharedUi, 'useModal') as jest.Mock
const openModal = jest.fn()
const closeModal = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ organizationId: 'organization-1' }),
}))

const llmProvider: LlmProviderResponse = {
  id: 'provider-1',
  name: 'Claude token',
  description: 'Personal token',
  type: LlmProviderType.CLAUDE,
  has_credential: true,
  scope: LlmProviderScope.USER,
  created_at: '2026-09-16T10:00:00Z',
  updated_at: '2026-09-16T10:00:00Z',
}

describe('LlmProviderSetting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useModalMock.mockReturnValue({ openModal, closeModal })
  })

  it('should create a token and select it', () => {
    const onChange = jest.fn()
    renderWithProviders(<LlmProviderSetting llmProviders={[]} value="" onChange={onChange} />)

    expect(screen.getByRole('link', { name: 'Agents → Tokens' })).toHaveAttribute(
      'href',
      '/organization/organization-1/settings/agents/tokens'
    )
    selectEvent.openMenu(screen.getByLabelText('Token'))
    screen.getByTestId('input-menu-list-button').click()

    expect(openModal).toHaveBeenCalledWith(expect.objectContaining({ options: { fakeModal: true, width: 680 } }))

    const modal = openModal.mock.calls[0][0].content as ReactElement<LlmProviderCreateEditModalProps>
    act(() => modal.props.onClose(llmProvider))

    expect(onChange).toHaveBeenCalledWith('provider-1')
    expect(closeModal).toHaveBeenCalled()
  })

  it('should replace the selector and dependent settings with a create token action when no token is available', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <LlmProviderSetting displayEmptyState llmProviders={[]} value="" onChange={onChange}>
        <div>Cloud settings JSON</div>
      </LlmProviderSetting>
    )

    expect(screen.queryByLabelText('Token')).not.toBeInTheDocument()
    expect(screen.queryByText('Cloud settings JSON')).not.toBeInTheDocument()
    expect(
      screen.getByText("You don't have a model provider token yet. Add one to configure this agent task.")
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'New token' }))
    expect(openModal).toHaveBeenCalledWith(expect.objectContaining({ options: { fakeModal: true, width: 680 } }))

    const modal = openModal.mock.calls[0][0].content as ReactElement<LlmProviderCreateEditModalProps>
    act(() => modal.props.onClose(llmProvider))

    expect(screen.getByLabelText('Token')).toBeInTheDocument()
    expect(screen.getByText('Cloud settings JSON')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith('provider-1')
  })

  it('should keep a selected token and dependent settings visible when the token is absent from the available list', () => {
    renderWithProviders(
      <LlmProviderSetting displayEmptyState llmProviders={[]} value="provider-1" onChange={jest.fn()}>
        <div>Cloud settings JSON</div>
      </LlmProviderSetting>
    )

    expect(screen.getByLabelText('Token')).toBeInTheDocument()
    expect(screen.getByText('Cloud settings JSON')).toBeInTheDocument()
    expect(screen.queryByText('No token available')).not.toBeInTheDocument()
  })

  it('should display the validation error in the empty state', () => {
    renderWithProviders(
      <LlmProviderSetting
        displayEmptyState
        error="Please select a token."
        llmProviders={[]}
        value=""
        onChange={jest.fn()}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Please select a token.')
  })
})
