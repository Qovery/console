import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageSettingsFeature from './page-settings-feature'

describe('PageSettingsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Routes location="/organization/1/cluster/2/general">
        <Route path="/organization/1/cluster/2/*" element={<PageSettingsFeature />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
