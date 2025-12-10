import { OrganizationEventApi, OrganizationEventTargetType } from 'qovery-typescript-axios'
import type { Option } from '@qovery/shared/ui'
import {
  buildSearchBarOptions,
  cacheEntityOption,
  clearSelectedOptionsCache,
  fetchTargetsAsync,
  getCachedOptionOrFetchEntity,
  getNonDynamicOption,
  makeConsistentSelectedOptions,
} from './multiple-selector-options-utils'

// Mock the qovery-typescript-axios module
jest.mock('qovery-typescript-axios')

describe('multiple-selector-options-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getNonDynamicOption', () => {
    it('should create targetType option with underscores replaced', () => {
      const result = getNonDynamicOption('targetType', 'CLOUD_PROVIDER')
      expect(result).toEqual({
        label: 'Type: Cloud provider',
        value: 'targetType:CLOUD_PROVIDER',
      })
    })

    it('should return cached option if available', () => {
      const option: Option = {
        label: 'Type: Application',
        value: 'targetType:APPLICATION',
      }
      cacheEntityOption(option)

      const result = getNonDynamicOption('targetType', 'APPLICATION')
      expect(result).toEqual(option)
    })

    it('should create targetType option with correct format', () => {
      const result = getNonDynamicOption('targetType', 'APPLICATION')
      expect(result).toEqual({
        label: 'Type: Application',
        value: 'targetType:APPLICATION',
      })
    })

    it('should create subTargetType option with correct format', () => {
      const result = getNonDynamicOption('subTargetType', 'CONFIG')
      expect(result).toEqual({
        label: 'Sub Type: Config',
        value: 'subTargetType:CONFIG',
      })
    })

    it('should create subTargetType option with underscores replaced', () => {
      const result = getNonDynamicOption('subTargetType', 'ADVANCED_SETTINGS')
      expect(result).toEqual({
        label: 'Sub Type: Advanced settings',
        value: 'subTargetType:ADVANCED_SETTINGS',
      })
    })

    it('should return unknown option for invalid requestParam', () => {
      const result = getNonDynamicOption('invalidParam', 'VALUE')
      expect(result).toEqual({
        label: 'Unknown',
        value: 'unknown:',
        description: 'Unknown',
      })
    })
  })

  describe('cacheEntityOption', () => {
    it('should cache option by its type', () => {
      const option: Option = {
        label: 'Project: My Project',
        value: 'projectId:123',
      }
      cacheEntityOption(option)

      const result = getNonDynamicOption('projectId', '123')
      expect(result).toEqual(option)
    })

    it('should cache targetId option', () => {
      const option: Option = {
        label: 'Target: My Target',
        value: 'targetId:456',
      }
      cacheEntityOption(option)

      const cachedResult = getNonDynamicOption('targetId', '456')
      expect(cachedResult).toEqual(option)
    })
  })

  describe('getCachedOptionOrFetchEntity', () => {
    const mockEventsApi = OrganizationEventApi as jest.MockedClass<typeof OrganizationEventApi>

    beforeEach(() => {
      clearSelectedOptionsCache()
      mockEventsApi.mockClear()
    })

    it('should return cached option if available', async () => {
      const option: Option = {
        label: 'Project: Cached Project',
        value: 'projectId:789',
      }
      cacheEntityOption(option)

      const result = await getCachedOptionOrFetchEntity(
        'org-1',
        OrganizationEventTargetType.APPLICATION,
        '789',
        'projectId',
        {}
      )

      expect(result).toEqual(option)
      expect(mockEventsApi).not.toHaveBeenCalled()
    })

    it('should fetch from API when not cached - projectId', async () => {
      const mockResponse = {
        data: {
          targets: [
            { id: 'proj-1', name: 'Test Project' },
            { id: 'proj-2', name: 'Another Project' },
          ],
        },
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      mockEventsApi.prototype.getOrganizationEventTargets = mockGetOrganizationEventTargets

      const queryParams = {
        fromTimestamp: '2024-01-01',
        toTimestamp: '2024-12-31',
      }

      const result = await getCachedOptionOrFetchEntity(
        'org-1',
        OrganizationEventTargetType.APPLICATION,
        'proj-1',
        'projectId',
        queryParams
      )

      expect(result).toEqual({
        label: 'Project: Test Project',
        value: 'projectId:proj-1',
      })
      expect(mockGetOrganizationEventTargets).toHaveBeenCalledWith(
        'org-1',
        '2024-01-01',
        '2024-12-31',
        undefined,
        OrganizationEventTargetType.APPLICATION,
        undefined,
        undefined,
        undefined,
        undefined,
        OrganizationEventTargetType.PROJECT
      )
    })

    it('should fetch from API when not cached - environmentId', async () => {
      const mockResponse = {
        data: {
          targets: [{ id: 'env-1', name: 'Production' }],
        },
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      mockEventsApi.prototype.getOrganizationEventTargets = mockGetOrganizationEventTargets

      const result = await getCachedOptionOrFetchEntity(
        'org-1',
        OrganizationEventTargetType.APPLICATION,
        'env-1',
        'environmentId',
        {}
      )

      expect(result).toEqual({
        label: 'Environment: Production',
        value: 'environmentId:env-1',
      })
      expect(mockGetOrganizationEventTargets).toHaveBeenCalledWith(
        'org-1',
        undefined,
        undefined,
        undefined,
        OrganizationEventTargetType.APPLICATION,
        undefined,
        undefined,
        undefined,
        undefined,
        OrganizationEventTargetType.ENVIRONMENT
      )
    })

    it('should fetch from API when not cached - targetId', async () => {
      const mockResponse = {
        data: {
          targets: [{ id: 'target-1', name: 'My Service' }],
        },
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      mockEventsApi.prototype.getOrganizationEventTargets = mockGetOrganizationEventTargets

      const result = await getCachedOptionOrFetchEntity(
        'org-1',
        OrganizationEventTargetType.APPLICATION,
        'target-1',
        'targetId',
        {}
      )

      expect(result).toEqual({
        label: 'Target: My Service',
        value: 'targetId:target-1',
      })
      expect(mockGetOrganizationEventTargets).toHaveBeenCalledWith(
        'org-1',
        undefined,
        undefined,
        undefined,
        OrganizationEventTargetType.APPLICATION,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      )
    })

    it('should return undefined when targets are not found in response', async () => {
      const mockResponse = {
        data: {},
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      mockEventsApi.prototype.getOrganizationEventTargets = mockGetOrganizationEventTargets

      const result = await getCachedOptionOrFetchEntity(
        'org-1',
        OrganizationEventTargetType.APPLICATION,
        'not-found',
        'projectId',
        {}
      )

      expect(result).toBeUndefined()
    })

    it('should return undefined when entity is not found', async () => {
      const mockResponse = {
        data: {
          targets: [{ id: 'proj-1', name: 'Test Project' }],
        },
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      mockEventsApi.prototype.getOrganizationEventTargets = mockGetOrganizationEventTargets

      const result = await getCachedOptionOrFetchEntity(
        'org-1',
        OrganizationEventTargetType.APPLICATION,
        'non-existent-id',
        'projectId',
        {}
      )

      expect(result).toBeUndefined()
    })
  })

  describe('buildSearchBarOptions', () => {
    it('should return target types when no options selected', () => {
      const result = buildSearchBarOptions({}, [], 'org-1')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('value')
      expect(result[0].value).toContain('targetType:')
      expect(result[0]).toHaveProperty('label')
    })

    it('should return project option when service type is selected', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Application',
          value: 'targetType:APPLICATION',
        },
      ]

      const result = buildSearchBarOptions({}, selectedOptions, 'org-1')

      const projectOption = result.find((opt) => opt.value === 'projectId:')
      expect(projectOption).toBeDefined()
      expect(projectOption?.label).toBe('Project')
      expect(projectOption?.onLoadSubOptions).toBeDefined()
    })

    it('should return environment option when project is selected for service type', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Application',
          value: 'targetType:APPLICATION',
        },
        {
          label: 'Project: My Project',
          value: 'projectId:123',
        },
      ]

      const result = buildSearchBarOptions({}, selectedOptions, 'org-1')

      const envOption = result.find((opt) => opt.value === 'environmentId:')
      expect(envOption).toBeDefined()
      expect(envOption?.label).toBe('Environment')
    })

    it('should return service option when project and environment are selected', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Application',
          value: 'targetType:APPLICATION',
        },
        {
          label: 'Project: My Project',
          value: 'projectId:123',
        },
        {
          label: 'Environment: Production',
          value: 'environmentId:456',
        },
      ]

      const result = buildSearchBarOptions({}, selectedOptions, 'org-1')

      const serviceOption = result.find((opt) => opt.value === 'targetId:')
      expect(serviceOption).toBeDefined()
      expect(serviceOption?.label.trim()).toBe('Application')
    })

    it('should handle ENVIRONMENT target type - without project', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Environment',
          value: 'targetType:ENVIRONMENT',
        },
      ]

      const result = buildSearchBarOptions({}, selectedOptions, 'org-1')

      const projectOption = result.find((opt) => opt.value === 'projectId:')
      expect(projectOption).toBeDefined()
      expect(projectOption?.label).toBe('Project')
    })

    it('should handle ENVIRONMENT target type - with project', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Environment',
          value: 'targetType:ENVIRONMENT',
        },
        {
          label: 'Project: My Project',
          value: 'projectId:123',
        },
      ]

      const result = buildSearchBarOptions({}, selectedOptions, 'org-1')

      const envOption = result.find((opt) => opt.value === 'targetId:')
      expect(envOption).toBeDefined()
      expect(envOption?.label).toBe('Environment')
    })

    it('should handle other target types (non-service, non-environment)', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Webhook',
          value: 'targetType:WEBHOOK',
        },
      ]

      const result = buildSearchBarOptions({}, selectedOptions, 'org-1')

      const targetOption = result.find((opt) => opt.value === 'targetId:')
      expect(targetOption).toBeDefined()
      expect(targetOption?.label).toBe('Choose Webhook')
    })

    it('should include sub-target types based on selected target type', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Application',
          value: 'targetType:APPLICATION',
        },
      ]

      const result = buildSearchBarOptions({}, selectedOptions, 'org-1')

      const subTypeOption = result.find((opt) => opt.value === 'subTargetType:')
      expect(subTypeOption).toBeDefined()
      expect(subTypeOption?.label).toBe('Sub Type')
      expect(subTypeOption?.subOptions).toBeDefined()
      expect(subTypeOption?.subOptions?.length).toBeGreaterThan(0)
    })

    it('should handle DATABASE target type', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Database',
          value: 'targetType:DATABASE',
        },
      ]

      const result = buildSearchBarOptions({}, selectedOptions, 'org-1')

      const projectOption = result.find((opt) => opt.value === 'projectId:')
      expect(projectOption).toBeDefined()
    })
  })

  describe('fetchTargetsAsync', () => {
    const mockEventsApi = OrganizationEventApi as jest.MockedClass<typeof OrganizationEventApi>

    it('should fetch targets and return formatted options - projectId', async () => {
      const mockResponse = {
        data: {
          targets: [
            { id: 'proj-1', name: 'Project 1' },
            { id: 'proj-2', name: 'Project 2' },
          ],
        },
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      const mockApiInstance = {
        getOrganizationEventTargets: mockGetOrganizationEventTargets,
      }

      const queryParams = {}
      const fetchFn = fetchTargetsAsync(
        queryParams,
        'org-1',
        mockApiInstance as unknown as OrganizationEventApi,
        OrganizationEventTargetType.APPLICATION,
        'projectId'
      )

      const result = await fetchFn()

      expect(result).toEqual([
        { value: 'projectId:proj-1', label: 'Project 1' },
        { value: 'projectId:proj-2', label: 'Project 2' },
      ])
      expect(mockGetOrganizationEventTargets).toHaveBeenCalledWith(
        'org-1',
        undefined,
        undefined,
        undefined,
        OrganizationEventTargetType.APPLICATION,
        undefined,
        undefined,
        undefined,
        undefined,
        OrganizationEventTargetType.PROJECT
      )
    })

    it('should fetch targets and return formatted options - environmentId', async () => {
      const mockResponse = {
        data: {
          targets: [{ id: 'env-1', name: 'Production' }],
        },
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      const mockApiInstance = {
        getOrganizationEventTargets: mockGetOrganizationEventTargets,
      }

      const fetchFn = fetchTargetsAsync(
        {},
        'org-1',
        mockApiInstance as unknown as OrganizationEventApi,
        OrganizationEventTargetType.APPLICATION,
        'environmentId'
      )

      const result = await fetchFn()

      expect(result).toEqual([{ value: 'environmentId:env-1', label: 'Production' }])
      expect(mockGetOrganizationEventTargets).toHaveBeenCalledWith(
        'org-1',
        undefined,
        undefined,
        undefined,
        OrganizationEventTargetType.APPLICATION,
        undefined,
        undefined,
        undefined,
        undefined,
        OrganizationEventTargetType.ENVIRONMENT
      )
    })

    it('should fetch targets and return formatted options - targetId', async () => {
      const mockResponse = {
        data: {
          targets: [{ id: 'target-1', name: 'My Service' }],
        },
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      const mockApiInstance = {
        getOrganizationEventTargets: mockGetOrganizationEventTargets,
      }

      const fetchFn = fetchTargetsAsync(
        {},
        'org-1',
        mockApiInstance as unknown as OrganizationEventApi,
        OrganizationEventTargetType.APPLICATION,
        'targetId'
      )

      const result = await fetchFn()

      expect(result).toEqual([{ value: 'targetId:target-1', label: 'My Service' }])
      expect(mockGetOrganizationEventTargets).toHaveBeenCalledWith(
        'org-1',
        undefined,
        undefined,
        undefined,
        OrganizationEventTargetType.APPLICATION,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      )
    })

    it('should return empty array when no targets found', async () => {
      const mockResponse = {
        data: {},
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      const mockApiInstance = {
        getOrganizationEventTargets: mockGetOrganizationEventTargets,
      }

      const fetchFn = fetchTargetsAsync(
        {},
        'org-1',
        mockApiInstance as unknown as OrganizationEventApi,
        OrganizationEventTargetType.APPLICATION,
        'projectId'
      )

      const result = await fetchFn()

      expect(result).toEqual([])
    })

    it('should handle query params correctly', async () => {
      const mockResponse = {
        data: {
          targets: [{ id: 'proj-1', name: 'Project 1' }],
        },
      }

      const mockGetOrganizationEventTargets = jest.fn().mockResolvedValue(mockResponse)
      const mockApiInstance = {
        getOrganizationEventTargets: mockGetOrganizationEventTargets,
      }

      const queryParams = {
        eventType: 'DEPLOYMENT',
        origin: 'USER',
        triggeredBy: 'user-123',
        fromTimestamp: '2024-01-01',
        toTimestamp: '2024-12-31',
        projectId: 'proj-1',
        environmentId: 'env-1',
      }

      const fetchFn = fetchTargetsAsync(
        queryParams,
        'org-1',
        mockApiInstance as unknown as OrganizationEventApi,
        OrganizationEventTargetType.APPLICATION,
        'targetId'
      )

      await fetchFn()

      expect(mockGetOrganizationEventTargets).toHaveBeenCalledWith(
        'org-1',
        '2024-01-01',
        '2024-12-31',
        'DEPLOYMENT',
        OrganizationEventTargetType.APPLICATION,
        'user-123',
        'USER',
        'proj-1',
        'env-1',
        undefined
      )
    })
  })

  describe('makeConsistentSelectedOptions', () => {
    it('should remove all options when no targetType is selected', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Project: My Project',
          value: 'projectId:123',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result).toEqual([])
    })

    it('should keep options consistent for service type hierarchy', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Application',
          value: 'targetType:APPLICATION',
        },
        {
          label: 'My Project',
          value: 'projectId:123',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('Type: Application')
      expect(result[1].label).toBe('Project: My Project')
    })

    it('should remove service when project and environment are missing', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Application',
          value: 'targetType:APPLICATION',
        },
        {
          label: 'My Service',
          value: 'targetId:789',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result).toHaveLength(1)
      expect(result[0].value).toBe('targetType:APPLICATION')
    })

    it('should remove environment when project is missing', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Application',
          value: 'targetType:APPLICATION',
        },
        {
          label: 'Production',
          value: 'environmentId:456',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result).toHaveLength(1)
      expect(result[0].value).toBe('targetType:APPLICATION')
    })

    it('should keep all service options when hierarchy is complete', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Application',
          value: 'targetType:APPLICATION',
        },
        {
          label: 'My Project',
          value: 'projectId:123',
        },
        {
          label: 'Production',
          value: 'environmentId:456',
        },
        {
          label: 'My Service',
          value: 'targetId:789',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result).toHaveLength(4)
    })

    it('should add prefix to labels without prefix', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Application',
          value: 'targetType:APPLICATION',
        },
        {
          label: 'My Project',
          value: 'projectId:123',
        },
        {
          label: 'Production',
          value: 'environmentId:456',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result[0].label).toBe('Type: Application')
      expect(result[1].label).toBe('Project: My Project')
      expect(result[2].label).toBe('Environment: Production')
    })

    it('should not modify labels that already have prefix', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Database',
          value: 'targetType:DATABASE',
        },
        {
          label: 'Project: My Project',
          value: 'projectId:123',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result[0].label).toBe('Type: Database')
      expect(result[1].label).toBe('Project: My Project')
    })

    it('should handle subTargetType correctly', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Application',
          value: 'targetType:APPLICATION',
        },
        {
          label: 'Config',
          value: 'subTargetType:CONFIG',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result).toHaveLength(2)
      expect(result[1].label).toBe('Sub Type: Config')
    })

    it('should handle target option with dynamic label', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Container',
          value: 'targetType:CONTAINER',
        },
        {
          label: 'Project: My Project',
          value: 'projectId:123',
        },
        {
          label: 'Environment: Staging',
          value: 'environmentId:456',
        },
        {
          label: 'My Container',
          value: 'targetId:789',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result[3].label).toBe('Container: My Container')
    })

    it('should handle TERRAFORM service type', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Terraform',
          value: 'targetType:TERRAFORM',
        },
        {
          label: 'My Project',
          value: 'projectId:123',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('Type: Terraform')
      expect(result[1].label).toBe('Project: My Project')
    })

    it('should handle JOB service type', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Job',
          value: 'targetType:JOB',
        },
        {
          label: 'My Project',
          value: 'projectId:123',
        },
        {
          label: 'Production',
          value: 'environmentId:456',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result).toHaveLength(3)
    })

    it('should handle HELM service type', () => {
      const selectedOptions: Option[] = [
        {
          label: 'Type: Helm',
          value: 'targetType:HELM',
        },
      ]

      const result = makeConsistentSelectedOptions(selectedOptions)

      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('Type: Helm')
    })
  })
})
