import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageEnvironmentLogs from './page-environment-logs'

describe('PageEnvironmentLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Routes location="/organization/1/project/2/environment/3/logs/4">
        <Route path="/organization/1/project/2/environment/3/logs/4/*" element={<PageEnvironmentLogs />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
