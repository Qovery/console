import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import PodLogsFeature, { type PodLogsFeatureProps } from './pod-logs-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3', serviceId: '4' }),
}))

describe('PodLogsFeature', () => {
  const props: PodLogsFeatureProps = {
    clusterId: '1',
  }

  it('should render successfully', () => {
    console.warn = jest.fn()

    const { baseElement } = render(
      <Routes location="/organization/1/project/2/environment/3/logs/">
        <Route
          path="/organization/1/project/2/environment/3/logs/4/service-logs"
          element={<PodLogsFeature {...props} />}
        />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
