import { render } from '@testing-library/react'

import InfraLogsPage from './infra-logs-page'

describe('InfraLogsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InfraLogsPage />)
    expect(baseElement).toBeTruthy()
  })
})
