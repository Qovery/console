import { type McpServerResponse } from 'qovery-typescript-axios'
import { type ReactElement } from 'react'
import selectEvent from 'react-select-event'
import * as sharedUi from '@qovery/shared/ui'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type McpServerCreateEditModalProps } from '../mcp-server-create-edit-modal/mcp-server-create-edit-modal'
import { McpServerSetting } from './mcp-server-setting'

const useModalMock = jest.spyOn(sharedUi, 'useModal') as jest.Mock
const openModal = jest.fn()
const closeModal = jest.fn()

const mcpServer: McpServerResponse = {
  id: 'mcp-1',
  name: 'GitLab',
  url: 'https://gitlab.example.com/mcp',
  header_names: new Set(),
  created_at: '2026-08-19T12:00:00Z',
  updated_at: '2026-08-19T12:00:00Z',
}

describe('McpServerSetting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useModalMock.mockReturnValue({ openModal, closeModal })
  })

  it('should create an organization MCP and select it', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <McpServerSetting mcpServers={[]} organizationId="organization-1" value={[]} onChange={onChange} />
    )

    selectEvent.openMenu(screen.getByLabelText('Organization MCPs'))
    await userEvent.click(screen.getByTestId('input-menu-list-button'))

    expect(openModal).toHaveBeenCalledWith(expect.objectContaining({ options: { fakeModal: true, width: 680 } }))

    const modal = openModal.mock.calls[0][0].content as ReactElement<McpServerCreateEditModalProps>
    // The modal is mocked: simulate its closing with the created MCP server
    act(() => modal.props.onClose(mcpServer))

    expect(onChange).toHaveBeenCalledWith(['mcp-1'])
    expect(closeModal).toHaveBeenCalled()
  })
})
