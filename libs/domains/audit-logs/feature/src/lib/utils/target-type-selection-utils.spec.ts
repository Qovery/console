import { OrganizationEventApi, OrganizationEventTargetType } from 'qovery-typescript-axios'
import { type SelectedItem } from '@qovery/shared/ui'
import { computeMenusToDisplay, getTargetTypeLabel } from './target-type-selection-utils'

const mockGetOrganizationEventTargets = jest.spyOn(OrganizationEventApi.prototype, 'getOrganizationEventTargets')

const targetTypeItem: SelectedItem = {
  filterKey: 'target_type',
  item: {
    value: OrganizationEventTargetType.AGENTIC_WORKFLOW,
    name: 'Agent task',
  },
}

describe('computeMenusToDisplay', () => {
  beforeEach(() => {
    mockGetOrganizationEventTargets.mockResolvedValue({
      data: { targets: [{ id: 'target-1', name: 'Target 1' }] },
    } as never)
  })

  it('loads the project, environment, and workflow levels for agentic workflows', async () => {
    const projects = await computeMenusToDisplay('organization-1', [targetTypeItem], {})

    expect(projects).toEqual({
      items: [{ value: 'target-1', name: 'Target 1' }],
      shouldDrillDown: false,
      filterKey: 'project_id',
    })
    expect(mockGetOrganizationEventTargets).toHaveBeenLastCalledWith(
      'organization-1',
      undefined,
      undefined,
      undefined,
      OrganizationEventTargetType.AGENTIC_WORKFLOW,
      undefined,
      undefined,
      undefined,
      undefined,
      OrganizationEventTargetType.PROJECT
    )

    const projectItem: SelectedItem = {
      filterKey: 'project_id',
      item: { value: 'project-1', name: 'Project 1' },
    }
    const environments = await computeMenusToDisplay('organization-1', [targetTypeItem, projectItem], {})

    expect(environments?.filterKey).toBe('environment_id')
    expect(mockGetOrganizationEventTargets).toHaveBeenLastCalledWith(
      'organization-1',
      undefined,
      undefined,
      undefined,
      OrganizationEventTargetType.AGENTIC_WORKFLOW,
      undefined,
      undefined,
      'project-1',
      undefined,
      OrganizationEventTargetType.ENVIRONMENT
    )

    const environmentItem: SelectedItem = {
      filterKey: 'environment_id',
      item: { value: 'environment-1', name: 'Environment 1' },
    }
    const workflows = await computeMenusToDisplay('organization-1', [targetTypeItem, projectItem, environmentItem], {})

    expect(workflows).toEqual({
      items: [{ value: 'target-1', name: 'Target 1', isLeaf: true }],
      shouldDrillDown: false,
      filterKey: 'target_id',
    })
    expect(mockGetOrganizationEventTargets).toHaveBeenLastCalledWith(
      'organization-1',
      undefined,
      undefined,
      undefined,
      OrganizationEventTargetType.AGENTIC_WORKFLOW,
      undefined,
      undefined,
      'project-1',
      'environment-1',
      undefined
    )
  })
})

describe('getTargetTypeLabel', () => {
  it('uses the Agent task product name for the agentic workflow API type', () => {
    expect(getTargetTypeLabel(OrganizationEventTargetType.AGENTIC_WORKFLOW)).toBe('Agent task')
  })

  it('formats other API target types', () => {
    expect(getTargetTypeLabel(OrganizationEventTargetType.CONTAINER_REGISTRY)).toBe('Container registry')
  })
})
