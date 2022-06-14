import { render } from '@testing-library/react'

import PagesLogsInfraUi from './pages-logs-infra-ui'

describe('PagesLogsInfraUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesLogsInfraUi />)
    expect(baseElement).toBeTruthy()
  })
})
