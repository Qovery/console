import { Route, Routes } from 'react-router-dom'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PreCheckLogsFeature, { type PreCheckLogsFeatureProps } from './pre-check-logs-feature'

describe('PreCheckLogsFeature', () => {
  const props: PreCheckLogsFeatureProps = {
    environment: environmentFactoryMock(1)[0],
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Routes location="/organization/1/project/2/environment/3/logs/">
        <Route
          path="/organization/1/project/2/environment/3/logs/4/pre-check-logs"
          element={<PreCheckLogsFeature {...props} />}
        />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
