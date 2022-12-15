import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router'
import PageJobCreateFeature from './page-job-create-feature'

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
}))

describe('PageJobCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/project/2/environment/3/services/create/cron-job/general">
        <Route
          path="/organization/1/project/2/environment/3/services/create/cron-job/*"
          element={<PageJobCreateFeature />}
        />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
