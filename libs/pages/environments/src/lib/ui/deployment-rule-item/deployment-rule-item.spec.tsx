import { render, screen } from '__tests__/utils/setup-jest'
import DeploymentRuleItem, { type DeploymentRuleItemProps } from './deployment-rule-item'

let props: DeploymentRuleItemProps

beforeEach(() => {
  props = {
    id: '1',
    name: 'Test',
    startTime: '1970-01-01T08:00:00.000Z',
    stopTime: '1970-01-01T19:00:00.000Z',
    weekDays: ['MONDAY', 'TUESDAY'],
    isLast: false,
    removeDeploymentRule: jest.fn(),
  }
})

describe('DeploymentRuleItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentRuleItem {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should be last element', () => {
    props.isLast = true

    render(<DeploymentRuleItem {...props} />)

    const item = screen.getByTestId('item')

    expect(item).toHaveClass('rounded-b')
  })

  it('should have start time and stop time', () => {
    props.startTime = '1970-01-01T08:10:00.000Z'
    props.startTime = '1970-01-01T08:14:00.000Z'

    render(<DeploymentRuleItem {...props} />)

    const time = screen.getByTestId('time')

    expect(time).toHaveTextContent(/08:14 - 19:00/)
  })

  it('should display running everyday sentences', () => {
    props.weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

    render(<DeploymentRuleItem {...props} />)

    const time = screen.getByTestId('time')

    expect(time).toHaveTextContent(/Running everyday/)
  })

  it('should display running every weekday', () => {
    props.weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

    render(<DeploymentRuleItem {...props} />)

    const time = screen.getByTestId('time')

    expect(time).toHaveTextContent(/Running every weekday/)
  })

  it('should display days formated', () => {
    props.weekDays = ['MONDAY', 'TUESDAY']

    render(<DeploymentRuleItem {...props} />)

    const time = screen.getByTestId('time')

    expect(time).toHaveTextContent(/Mon, Tue/)
  })
})
