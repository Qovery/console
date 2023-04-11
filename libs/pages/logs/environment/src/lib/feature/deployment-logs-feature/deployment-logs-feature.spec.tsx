import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import DeploymentLogsFeature, { DeploymentLogsFeatureProps } from './deployment-logs-feature'

describe('DeploymentLogsFeature', () => {
  const props: DeploymentLogsFeatureProps = {
    clusterId: '1',
    setServiceId: jest.fn(),
  }

  it('should render successfully', () => {
    console.warn = jest.fn()

    const { baseElement } = render(
      <Routes location="/organization/1/project/2/environment/3/logs/">
        <Route
          path="/organization/1/project/2/environment/3/logs/4/deployment"
          element={<DeploymentLogsFeature {...props} />}
        />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
