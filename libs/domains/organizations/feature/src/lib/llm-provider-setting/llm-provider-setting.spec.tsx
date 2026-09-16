import { type LlmProviderResponse, LlmProviderScope, LlmProviderType } from 'qovery-typescript-axios'
import { type ReactElement } from 'react'
import selectEvent from 'react-select-event'
import { act } from '@testing-library/react'
import * as sharedUi from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type LlmProviderCreateEditModalProps } from '../llm-provider-create-edit-modal/llm-provider-create-edit-modal'
import { LlmProviderSetting } from './llm-provider-setting'

const useModalMock = jest.spyOn(sharedUi, 'useModal') as jest.Mock
const openModal = jest.fn()
const closeModal = jest.fn()

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
    renderWithProviders(
      <LlmProviderSetting llmProviders={[]} organizationId="organization-1" value="" onChange={onChange} />
    )

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
})
