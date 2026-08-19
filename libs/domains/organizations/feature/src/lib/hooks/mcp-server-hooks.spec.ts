import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'
import { useCreateMcpServer } from './use-create-mcp-server/use-create-mcp-server'
import { useDeleteMcpServer } from './use-delete-mcp-server/use-delete-mcp-server'
import { useEditMcpServer } from './use-edit-mcp-server/use-edit-mcp-server'
import { useMcpServers } from './use-mcp-servers/use-mcp-servers'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}))

const useMutationMock = jest.mocked(useMutation)
const useQueryMock = jest.mocked(useQuery)
const useQueryClientMock = jest.mocked(useQueryClient)
const invalidateQueries = jest.fn()

describe('MCP server hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>)
    useQueryMock.mockReturnValue({} as ReturnType<typeof useQuery>)
    useQueryClientMock.mockReturnValue({ invalidateQueries } as unknown as ReturnType<typeof useQueryClient>)
  })

  it('should configure the organization MCP server query', () => {
    renderHook(() => useMcpServers({ organizationId: 'org-1', suspense: true, enabled: false }))

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queries.organizations.mcpServers({ organizationId: 'org-1' }).queryKey,
        suspense: true,
        enabled: false,
      })
    )
  })

  it.each([
    [useCreateMcpServer, mutations.createMcpServer, 'Your MCP connector has been created'],
    [useEditMcpServer, mutations.editMcpServer, 'Your MCP connector has been updated'],
    [useDeleteMcpServer, mutations.deleteMcpServer, 'Your MCP connector has been deleted'],
  ])('should invalidate the organization list after a mutation', (useMcpServerMutation, mutation, title) => {
    renderHook(() => useMcpServerMutation())

    expect(useMutationMock).toHaveBeenCalledWith(
      mutation,
      expect.objectContaining({
        meta: {
          notifyOnSuccess: { title },
          notifyOnError: true,
        },
      })
    )

    const options = useMutationMock.mock.calls[0][1]
    options?.onSuccess?.(undefined, { organizationId: 'org-1' } as never, undefined)

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queries.organizations.mcpServers({ organizationId: 'org-1' }).queryKey,
    })
  })
})
