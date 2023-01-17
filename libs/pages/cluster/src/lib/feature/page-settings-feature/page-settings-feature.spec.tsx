import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router'
import PageSettingsFeature from './page-settings-feature'

describe('PageSettingsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/cluster/2/general">
        <Route path="/organization/1/cluster/2/*" element={<PageSettingsFeature />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
