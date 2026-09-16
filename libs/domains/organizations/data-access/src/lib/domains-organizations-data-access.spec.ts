import {
  LLMProvidersApi,
  LlmProviderScope,
  LlmProviderType,
  MCPServersApi,
  OrganizationMainCallsApi,
  OrganizationOnboardingStatusEnum,
} from 'qovery-typescript-axios'
import { mutations, organizations } from './domains-organizations-data-access'

describe('organizations.onboarding', () => {
  it('should return onboarding data', async () => {
    const mockData = { use_cases: 'ephemeral-environments,rde', status: OrganizationOnboardingStatusEnum.IN_PROGRESS }
    jest
      .spyOn(OrganizationMainCallsApi.prototype, 'getOrganizationOnboarding')
      .mockResolvedValue({ data: mockData } as never)

    const query = organizations.onboarding({ organizationId: 'org-1' })
    const result = await query.queryFn({} as never)

    expect(OrganizationMainCallsApi.prototype.getOrganizationOnboarding).toHaveBeenCalledWith('org-1')
    expect(result).toEqual(mockData)
  })

  it('should have the organizationId in the queryKey', () => {
    const query = organizations.onboarding({ organizationId: 'org-1' })
    expect(query.queryKey).toContain('org-1')
  })
})

describe('mutations.updateOrganizationOnboarding', () => {
  it('should call updateOrganizationOnboarding with correct args', async () => {
    const mockData = { use_cases: 'rde', status: OrganizationOnboardingStatusEnum.DISMISSED }
    jest
      .spyOn(OrganizationMainCallsApi.prototype, 'updateOrganizationOnboarding')
      .mockResolvedValue({ data: mockData } as never)

    const result = await mutations.updateOrganizationOnboarding({
      organizationId: 'org-1',
      onboardingPatchRequest: { status: OrganizationOnboardingStatusEnum.DISMISSED },
    })

    expect(OrganizationMainCallsApi.prototype.updateOrganizationOnboarding).toHaveBeenCalledWith('org-1', {
      status: OrganizationOnboardingStatusEnum.DISMISSED,
    })
    expect(result).toEqual(mockData)
  })
})

describe('organizations.mcpServers', () => {
  it('should return organization MCP servers', async () => {
    const mockData = [{ id: 'mcp-1', name: 'GitHub' }]
    jest.spyOn(MCPServersApi.prototype, 'listMcpServers').mockResolvedValue({ data: { results: mockData } } as never)

    const query = organizations.mcpServers({ organizationId: 'org-1' })
    const result = await query.queryFn({} as never)

    expect(MCPServersApi.prototype.listMcpServers).toHaveBeenCalledWith('org-1')
    expect(result).toEqual(mockData)
    expect(query.queryKey).toContain('org-1')
  })
})

describe('MCP server mutations', () => {
  const mcpServerRequest = {
    name: 'GitHub',
    description: 'GitHub tools',
    url: 'https://example.com/mcp',
    headers: { Authorization: 'Bearer secret' },
  }

  it('should create an MCP server', async () => {
    const mockData = { id: 'mcp-1', ...mcpServerRequest }
    jest.spyOn(MCPServersApi.prototype, 'createMcpServer').mockResolvedValue({ data: mockData } as never)

    const result = await mutations.createMcpServer({ organizationId: 'org-1', mcpServerRequest })

    expect(MCPServersApi.prototype.createMcpServer).toHaveBeenCalledWith('org-1', mcpServerRequest)
    expect(result).toEqual(mockData)
  })

  it('should create the read-only Qovery MCP server', async () => {
    const mockData = { id: 'qovery-mcp', name: 'Qovery MCP', url: 'https://mcp.qovery.com/mcp' }
    jest.spyOn(MCPServersApi.prototype, 'createQoveryMcpServer').mockResolvedValue({ data: mockData } as never)

    const result = await mutations.createQoveryMcpServer({ organizationId: 'org-1' })

    expect(MCPServersApi.prototype.createQoveryMcpServer).toHaveBeenCalledWith('org-1', undefined)
    expect(result).toEqual(mockData)
  })

  it('should edit an MCP server', async () => {
    const mockData = { id: 'mcp-1', ...mcpServerRequest }
    jest.spyOn(MCPServersApi.prototype, 'editMcpServer').mockResolvedValue({ data: mockData } as never)

    const result = await mutations.editMcpServer({
      organizationId: 'org-1',
      mcpServerId: 'mcp-1',
      mcpServerRequest,
    })

    expect(MCPServersApi.prototype.editMcpServer).toHaveBeenCalledWith('mcp-1', mcpServerRequest)
    expect(result).toEqual(mockData)
  })

  it('should delete an MCP server', async () => {
    jest.spyOn(MCPServersApi.prototype, 'deleteMcpServer').mockResolvedValue({ data: undefined } as never)

    await mutations.deleteMcpServer({ organizationId: 'org-1', mcpServerId: 'mcp-1' })

    expect(MCPServersApi.prototype.deleteMcpServer).toHaveBeenCalledWith('mcp-1')
  })
})

describe('organizations.llmProviders', () => {
  it('should return organization LLM providers', async () => {
    const mockData = [{ id: 'provider-1', name: 'Claude' }]
    jest
      .spyOn(LLMProvidersApi.prototype, 'listLlmProviders')
      .mockResolvedValue({ data: { results: mockData } } as never)

    const query = organizations.llmProviders({ organizationId: 'org-1' })
    const result = await query.queryFn({} as never)

    expect(LLMProvidersApi.prototype.listLlmProviders).toHaveBeenCalledWith('org-1')
    expect(result).toEqual(mockData)
    expect(query.queryKey).toContain('org-1')
  })
})

describe('LLM provider mutations', () => {
  const llmProviderRequest = {
    name: 'Claude',
    type: LlmProviderType.CLAUDE,
    credential: 'secret',
    scope: LlmProviderScope.USER,
  }

  it('should create an LLM provider', async () => {
    const mockData = { id: 'provider-1', ...llmProviderRequest }
    jest.spyOn(LLMProvidersApi.prototype, 'createLlmProvider').mockResolvedValue({ data: mockData } as never)

    const result = await mutations.createLlmProvider({ organizationId: 'org-1', llmProviderRequest })

    expect(LLMProvidersApi.prototype.createLlmProvider).toHaveBeenCalledWith('org-1', llmProviderRequest)
    expect(result).toEqual(mockData)
  })

  it('should edit an LLM provider', async () => {
    const mockData = { id: 'provider-1', ...llmProviderRequest }
    jest.spyOn(LLMProvidersApi.prototype, 'editLlmProvider').mockResolvedValue({ data: mockData } as never)

    const result = await mutations.editLlmProvider({
      organizationId: 'org-1',
      llmProviderId: 'provider-1',
      llmProviderRequest,
    })

    expect(LLMProvidersApi.prototype.editLlmProvider).toHaveBeenCalledWith('provider-1', llmProviderRequest)
    expect(result).toEqual(mockData)
  })

  it('should delete an LLM provider', async () => {
    jest.spyOn(LLMProvidersApi.prototype, 'deleteLlmProvider').mockResolvedValue({ data: undefined } as never)

    await mutations.deleteLlmProvider({ organizationId: 'org-1', llmProviderId: 'provider-1' })

    expect(LLMProvidersApi.prototype.deleteLlmProvider).toHaveBeenCalledWith('provider-1')
  })
})
