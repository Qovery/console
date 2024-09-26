import { StateEnum, type Status } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { FiltersStageStep, type FiltersStageStepProps } from './filters-stage-step'

const mockToggleColumnFilter = jest.fn()
const mockIsFilterActive = jest.fn()

const defaultProps: FiltersStageStepProps = {
  serviceStatus: {
    state: StateEnum.BUILDING,
    steps: {
      details: [
        { step_name: 'BUILD', status: 'SUCCESS', duration_sec: 60 },
        { step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 120 },
      ],
    },
  } as Status,
  toggleColumnFilter: mockToggleColumnFilter,
  isFilterActive: mockIsFilterActive,
}

describe('FiltersStageStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders BUILD and DEPLOY buttons', () => {
    renderWithProviders(<FiltersStageStep {...defaultProps} />)
    expect(screen.getByText('Build')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
  })

  it('calls toggleColumnFilter with correct type when buttons are clicked', async () => {
    const { userEvent } = renderWithProviders(<FiltersStageStep {...defaultProps} />)
    await userEvent.click(screen.getByText('Build'))
    expect(mockToggleColumnFilter).toHaveBeenCalledWith('BUILD')
    await userEvent.click(screen.getByText('Deploy'))
    expect(mockToggleColumnFilter).toHaveBeenCalledWith('DEPLOY')
  })

  it('displays correct duration for build and deploy steps', () => {
    renderWithProviders(<FiltersStageStep {...defaultProps} />)
    expect(screen.getByText('1m : 0s')).toBeInTheDocument() // BUILD duration
    expect(screen.getByText('2m : 0s')).toBeInTheDocument() // DEPLOY duration
  })

  it('applies correct classes based on status and isFilterActive', () => {
    mockIsFilterActive.mockImplementation((type) => type === 'BUILD')
    renderWithProviders(<FiltersStageStep {...defaultProps} />)

    const buildButton = screen.getByText('Build').closest('button')
    const deployButton = screen.getByText('Deploy').closest('button')

    expect(buildButton).toHaveClass('border-brand-500', 'bg-neutral-500')
    expect(deployButton).not.toHaveClass('border-neutral-300', 'bg-neutral-500')
  })

  it('handles different states correctly', () => {
    const props = {
      ...defaultProps,
      serviceStatus: {
        ...defaultProps.serviceStatus,
        state: StateEnum.BUILDING,
      },
    }
    renderWithProviders(<FiltersStageStep {...props} />)

    const buildButton = screen.getByText('Build').closest('button')
    const deployButton = screen.getByText('Deploy').closest('button')

    expect(buildButton).toHaveClass('border-neutral-500', 'bg-neutral-650')
    expect(deployButton).not.toHaveClass('border-brand-500', 'bg-neutral-500')
  })
})
