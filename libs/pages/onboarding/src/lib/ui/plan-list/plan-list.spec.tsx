import { render } from '__tests__/utils/setup-jest'
import { createElement } from 'react'
import PlanList, { type PlanListProps } from './plan-list'

describe('PlanList', () => {
  let props: PlanListProps

  beforeEach(() => {
    props = {
      title: 'some-title',
      description: 'some-desc',
      lists: [createElement('div')],
      infos: 'some-infos',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PlanList {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
