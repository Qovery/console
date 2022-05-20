import { render } from '__tests__/utils/setup-jest'

import DeploymentRuleItem, { DeploymentRuleItemProps } from './deployment-rule-item'

let props: DeploymentRuleItemProps

beforeEach(() => {
  props = {
    name: 'Test',
    startTime: '1970-01-01T08:00:00.000Z',
    stopTime: '1970-01-01T19:00:00.000Z',
    weekDays: ['MONDAY', 'TUESDAY'],
    isLast: false,
  }
})

describe('DeploymentRuleItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentRuleItem {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
