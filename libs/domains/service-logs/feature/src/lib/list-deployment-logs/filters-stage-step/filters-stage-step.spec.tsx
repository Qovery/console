import { StateEnum, type Status } from 'qovery-typescript-axios'
import { type Terraform } from '@qovery/domains/services/data-access'
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

jest.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: '/', hash: '' }),
}))

describe('FiltersStageStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders BUILD and DEPLOY buttons', () => {
    renderWithProviders(<FiltersStageStep {...defaultProps} />)
    expect(screen.getByText('Build')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
    expect(screen.queryByText('Executing')).not.toBeInTheDocument()
  })

  it('renders EXECUTING button for Terraform services', () => {
    const props = {
      ...defaultProps,
      service: {
        ...defaultProps.service,
        serviceType: 'TERRAFORM',
      } as Terraform,
      serviceStatus: {
        ...defaultProps.serviceStatus,
        state: StateEnum.EXECUTING,
      },
    }
    renderWithProviders(<FiltersStageStep {...props} />)
    expect(screen.getByText('Executing')).toBeInTheDocument()
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
})
