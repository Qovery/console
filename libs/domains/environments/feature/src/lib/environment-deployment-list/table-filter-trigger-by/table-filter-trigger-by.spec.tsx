import { type Column } from '@tanstack/react-table'
import { type DeploymentHistoryEnvironmentV2 } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { TableFilterTriggerBy } from './table-filter-trigger-by'

describe('TableFilterTriggerBy', () => {
  const mockColumn = {
    getFacetedRowModel: () => ({
      rows: [
        {
          original: {
            auditing_data: {
              triggered_by: 'John Doe',
            },
          },
        },
        {
          original: {
            auditing_data: {
              triggered_by: 'John Soe',
            },
          },
        },
      ],
    }),
    getFacetedUniqueValues: () =>
      new Map([
        ['API', 1],
        ['CLI', 1],
        ['CONSOLE', 1],
      ]),
    getIsFiltered: jest.fn().mockReturnValue(false),
    getFilterValue: jest.fn().mockReturnValue(null),
    setFilterValue: jest.fn(),
    columnDef: {
      header: 'Trigger',
    },
  } as unknown as Column<DeploymentHistoryEnvironmentV2, unknown>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays filtered state with API value', () => {
    const filteredColumn = {
      ...mockColumn,
      getIsFiltered: jest.fn().mockReturnValue(true),
      getFilterValue: jest.fn().mockReturnValue({
        origin: ['API'],
      }),
    } as unknown as Column<DeploymentHistoryEnvironmentV2, unknown>

    renderWithProviders(<TableFilterTriggerBy column={filteredColumn} />)

    expect(screen.getByText('API')).toBeInTheDocument()
  })

  it('displays filtered state with manual deploy value', () => {
    const filteredColumn = {
      ...mockColumn,
      getIsFiltered: jest.fn().mockReturnValue(true),
      getFilterValue: jest.fn().mockReturnValue({
        origin: ['CONSOLE'],
      }),
    } as unknown as Column<DeploymentHistoryEnvironmentV2, unknown>

    renderWithProviders(<TableFilterTriggerBy column={filteredColumn} />)

    expect(screen.getByText('console')).toBeInTheDocument()
  })

  it('displays dropdown list with trigger values and user values when opened', async () => {
    const { userEvent } = renderWithProviders(<TableFilterTriggerBy column={mockColumn} />)

    await userEvent.click(screen.getByRole('button'))

    expect(screen.getByText('Trigger by')).toBeInTheDocument()
    expect(screen.getByText('From')).toBeInTheDocument()

    expect(screen.getByText('API')).toBeInTheDocument()
    expect(screen.getByText('CLI')).toBeInTheDocument()
    expect(screen.getByText('console')).toBeInTheDocument()

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('John Soe')).toBeInTheDocument()
  })
})
