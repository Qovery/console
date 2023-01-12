import { getAllByTestId, getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { cronjobFactoryMock, lifecycleJobFactoryMock } from '@qovery/shared/factories'
import JobOverview, { JobOverviewProps } from './job-overview'

const props: JobOverviewProps = {
  application: {
    ...lifecycleJobFactoryMock(1)[0],
  },
}

describe('JobOverview', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<JobOverview {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display 6 property card', () => {
    const { baseElement } = render(<JobOverview {...props} />)

    getAllByTestId(baseElement, 'property-card')
    expect(getAllByTestId(baseElement, 'property-card')).toHaveLength(6)
  })

  it('should display scheduling property card if cron', () => {
    const cron = cronjobFactoryMock(1)[0]
    const { baseElement } = render(<JobOverview {...props} application={cron} />)

    getByText(baseElement, 'Scheduling')
  })

  it('should display Environment Event property card if lifecycle and display Start - Delete', () => {
    const lifecycle = lifecycleJobFactoryMock(1)[0]
    lifecycle.schedule = {
      on_start: {},
      on_delete: {},
    }
    const { baseElement } = render(<JobOverview {...props} application={lifecycle} />)

    getByText(baseElement, 'Environment Event')
    getByText(baseElement, 'Start - Delete')
  })

  it('should display only Delete', () => {
    const lifecycle = lifecycleJobFactoryMock(1)[0]
    lifecycle.schedule = {
      on_delete: {},
    }
    const { baseElement } = render(<JobOverview {...props} application={lifecycle} />)

    getByText(baseElement, 'Delete')
  })
})
