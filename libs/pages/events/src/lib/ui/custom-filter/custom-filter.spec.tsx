import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import { addMonths } from 'date-fns'
import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { environmentFactoryMock, projectsFactoryMock } from '@qovery/shared/factories'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import CustomFilter, { type CustomFilterProps } from './custom-filter'

const mockProjects = projectsFactoryMock(2)
const mockEnvironments = environmentFactoryMock(2)

describe('CustomFilter', () => {
  const props: CustomFilterProps = {
    onChangeType: jest.fn(),
    clearFilter: jest.fn(),
    onChangeClearTimestamp: jest.fn(),
    onChangeTimestamp: jest.fn(),
    setIsOpenTimestamp: jest.fn(),
    isOpenTimestamp: false,
    timestamps: undefined,
    projects: mockProjects,
    environments: mockEnvironments,
    eventsTargetsData: [
      {
        id: '0',
        name: 'my-target',
      },
    ],
    displayEventTargets: true,
    targetType: OrganizationEventTargetType.APPLICATION,
    projectId: mockProjects[0].id,
    environmentId: mockEnvironments[0].id,
    targetId: '0',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    render(<CustomFilter {...props} />)

    expect(screen.getByText('Select')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('should render timeframe button when timestamps are not provided', () => {
    render(<CustomFilter {...props} />)

    expect(screen.getByTestId('timeframe-button')).toBeInTheDocument()
  })

  it('should render timeframe values when timestamps are provided', () => {
    props.timestamps = [new Date(), addMonths(new Date(), -1)]
    render(<CustomFilter {...props} />)

    expect(screen.getByTestId('timeframe-values')).toBeInTheDocument()
  })

  it('should call onChangeClearTimestamp when clicking clear timestamp icon', () => {
    props.timestamps = [new Date(), addMonths(new Date(), -1)]
    render(<CustomFilter {...props} />)

    fireEvent.click(screen.getByTestId('clear-timestamp'))
    expect(props.onChangeClearTimestamp).toHaveBeenCalled()
  })

  it('should call onChangeClearTimestamp when clearing the timeframe', async () => {
    props.timestamps = [new Date(), new Date()]

    render(<CustomFilter {...props} />)
    expect(screen.getByTestId('timeframe-values')).toHaveTextContent(
      `from: ${dateYearMonthDayHourMinuteSecond(
        props.timestamps[0],
        true,
        false
      )} - to: ${dateYearMonthDayHourMinuteSecond(props.timestamps[1], true, false)}`
    )
    screen.getByTestId('clear-timestamp').click()
    expect(props.onChangeClearTimestamp).toHaveBeenCalled()
  })

  it('should render correct timeframe button label if timestamps are provided', () => {
    props.timestamps = [new Date(), new Date()]

    render(<CustomFilter {...props} />)
    expect(screen.getByTestId('timeframe-values')).toHaveTextContent(
      `from: ${dateYearMonthDayHourMinuteSecond(
        props.timestamps[0],
        true,
        false
      )} - to: ${dateYearMonthDayHourMinuteSecond(props.timestamps[1], true, false)}`
    )
  })

  it('should render targetType, projects, environments and target with values', () => {
    render(<CustomFilter {...props} />)

    screen.getByText('Application')
    screen.getByText(mockProjects[0].name)
    screen.getByText(mockEnvironments[0].name)
    screen.getByText('my-target')
  })
})
