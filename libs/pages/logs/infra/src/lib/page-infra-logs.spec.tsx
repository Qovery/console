import { render } from '__tests__/utils/setup-jest'

import PageInfraLogs from './page-infra-logs'

describe('PageInfraLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageInfraLogs />)
    expect(baseElement).toBeTruthy()
  })
})
