import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import PageEnvironmentLogs from './page-environment-logs'

describe('PageEnvironmentLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/project/2/environment/3/logs/4">
        <Route path="/organization/1/project/2/environment/3/logs/4/*" element={<PageEnvironmentLogs />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
