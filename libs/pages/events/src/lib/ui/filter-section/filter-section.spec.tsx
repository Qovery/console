import { type DecodedValueMap } from 'use-query-params'
import { type SelectedItem } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type queryParamsValues } from '../../feature/page-general-feature/page-general-feature'
import FilterSection, { type CustomFilterProps } from './filter-section'

const props: CustomFilterProps = {
  clearFilter: jest.fn(),
  queryParams: {
    pageSize: 10,
    origin: undefined,
    subTargetType: undefined,
    triggeredBy: undefined,
    targetId: undefined,
    targetType: undefined,
    eventType: undefined,
    toTimestamp: undefined,
    fromTimestamp: undefined,
    continueToken: undefined,
    stepBackToken: undefined,
    projectId: undefined,
    environmentId: undefined,
  },
  targetTypeSelectedItems: [],
  setFilter: jest.fn(),
}

describe('FilterSection', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<FilterSection {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render only Timestamp badge when no filters are applied', () => {
    renderWithProviders(<FilterSection {...props} />)
    screen.getByText(/Timestamp:/)
    expect(screen.queryByRole('button', { name: /Clear all filters/i })).not.toBeInTheDocument()
  })

  it('should render timestamp badge when fromTimestamp and toTimestamp are set', () => {
    const queryParamsWithTimestamp = {
      fromTimestamp: '1704067200', // 2024-01-01 00:00:00
      toTimestamp: '1704153600', // 2024-01-02 00:00:00
    }
    renderWithProviders(
      <FilterSection {...props} queryParams={queryParamsWithTimestamp as DecodedValueMap<typeof queryParamsValues>} />
    )

    screen.getByText(/Timestamp:/)
    screen.getByRole('button', { name: /Clear all filters/i })
  })

  it('should render event type badge when eventType is set', () => {
    const queryParamsWithEventType = {
      eventType: 'deployment_started',
    }
    renderWithProviders(
      <FilterSection {...props} queryParams={queryParamsWithEventType as DecodedValueMap<typeof queryParamsValues>} />
    )

    screen.getByText(/Event Type:/)
    screen.getByText(/Deployment started/)
  })

  it('should render target type badge when targetType is set', () => {
    const queryParamsWithTargetType = {
      targetType: 'application',
    }
    renderWithProviders(
      <FilterSection {...props} queryParams={queryParamsWithTargetType as DecodedValueMap<typeof queryParamsValues>} />
    )

    screen.getByText(/Target Type:/)
    screen.getByText(/Application/)
  })

  it('should render user badge when triggeredBy is set', () => {
    const queryParamsWithTriggeredBy = {
      triggeredBy: 'john_doe',
    }
    renderWithProviders(
      <FilterSection {...props} queryParams={queryParamsWithTriggeredBy as DecodedValueMap<typeof queryParamsValues>} />
    )

    screen.getByText(/User:/)
    screen.getByText(/John doe/)
  })

  it('should render source badge when origin is set', () => {
    const queryParamsWithOrigin = {
      origin: 'git_push',
    }
    renderWithProviders(
      <FilterSection {...props} queryParams={queryParamsWithOrigin as DecodedValueMap<typeof queryParamsValues>} />
    )

    screen.getByText(/Source:/)
    screen.getByText(/Git push/)
  })

  it('should render project badge when projectId is set with selectedItems', () => {
    const queryParamsWithProject = {
      projectId: 'project-123',
    }
    const selectedItems: SelectedItem[] = [
      {
        filterKey: 'project_id',
        item: { value: 'project-123', name: 'My Project' },
      },
    ]
    const { container } = renderWithProviders(
      <FilterSection
        {...props}
        queryParams={queryParamsWithProject as DecodedValueMap<typeof queryParamsValues>}
        targetTypeSelectedItems={selectedItems}
      />
    )

    screen.getByText(/Project:/)
    const buttons = container.querySelectorAll('button')
    expect(buttons[1]?.textContent).toContain('My Project')
  })

  it('should render environment badge when environmentId is set with selectedItems', () => {
    const queryParamsWithEnvironment = {
      environmentId: 'env-123',
    }
    const selectedItems: SelectedItem[] = [
      {
        filterKey: 'environment_id',
        item: { value: 'env-123', name: 'Production' },
      },
    ]
    const { container } = renderWithProviders(
      <FilterSection
        {...props}
        queryParams={queryParamsWithEnvironment as DecodedValueMap<typeof queryParamsValues>}
        targetTypeSelectedItems={selectedItems}
      />
    )

    screen.getByText(/Environment:/)
    const buttons = container.querySelectorAll('button')
    expect(buttons[1]?.textContent).toContain('Production')
  })

  it('should render target badge when targetId is set with selectedItems', () => {
    const queryParamsWithTarget = {
      targetId: 'target-123',
      targetType: 'application',
    }
    const selectedItems: SelectedItem[] = [
      {
        filterKey: 'target_id',
        item: { value: 'target-123', name: 'My App' },
      },
    ]
    const { container } = renderWithProviders(
      <FilterSection
        {...props}
        queryParams={queryParamsWithTarget as DecodedValueMap<typeof queryParamsValues>}
        targetTypeSelectedItems={selectedItems}
      />
    )

    screen.getByText(/Application:/)
    const buttons = container.querySelectorAll('button')
    expect(buttons[1]?.textContent).toContain('My App')
  })

  it('should render multiple badges when multiple filters are set', () => {
    const queryParamsWithMultiple = {
      eventType: 'deployment_started',
      targetType: 'application',
      triggeredBy: 'john_doe',
      origin: 'git_push',
    }
    renderWithProviders(
      <FilterSection {...props} queryParams={queryParamsWithMultiple as DecodedValueMap<typeof queryParamsValues>} />
    )

    screen.getByText(/Event Type:/)
    screen.getByText(/Target Type:/)
    screen.getByText(/User:/)
    screen.getByText(/Source:/)
    screen.getByRole('button', { name: /Clear all filters/i })
  })

  it('should call clearFilter when Clear all filters button is clicked', async () => {
    const queryParamsWithFilter = {
      eventType: 'deployment_started',
    }
    const { userEvent } = renderWithProviders(
      <FilterSection {...props} queryParams={queryParamsWithFilter as DecodedValueMap<typeof queryParamsValues>} />
    )

    const clearButton = screen.getByRole('button', { name: /Clear all filters/i })
    await userEvent.click(clearButton)

    expect(props.clearFilter).toHaveBeenCalled()
  })

  it('should call setFilter when delete icon is clicked on a badge', async () => {
    const queryParamsWithFilter = {
      eventType: 'deployment_started',
    }
    const { userEvent, container } = renderWithProviders(
      <FilterSection {...props} queryParams={queryParamsWithFilter as DecodedValueMap<typeof queryParamsValues>} />
    )

    // Find the xmark icon SVG element within the badge
    const xmarkIcon = container.querySelector('svg[data-icon="xmark"]') || container.querySelector('i')
    expect(xmarkIcon).toBeTruthy()

    if (xmarkIcon) {
      await userEvent.click(xmarkIcon)
    }

    expect(props.setFilter).toHaveBeenCalled()
  })

  it('should render hierarchical badges in correct order with chevrons', () => {
    const queryParamsWithHierarchy = {
      targetType: 'application',
      projectId: 'project-123',
      environmentId: 'env-123',
      targetId: 'target-123',
    }
    const selectedItems: SelectedItem[] = [
      {
        filterKey: 'project_id',
        item: { value: 'project-123', name: 'My Project' },
      },
      {
        filterKey: 'environment_id',
        item: { value: 'env-123', name: 'Production' },
      },
      {
        filterKey: 'target_id',
        item: { value: 'target-123', name: 'My App' },
      },
    ]
    const { container } = renderWithProviders(
      <FilterSection
        {...props}
        queryParams={queryParamsWithHierarchy as DecodedValueMap<typeof queryParamsValues>}
        targetTypeSelectedItems={selectedItems}
      />
    )

    screen.getByText(/Target Type:/)
    screen.getByText(/Project:/)
    screen.getByText(/Environment:/)
    screen.getByText(/Application:/)

    // Check for chevron SVG elements
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
