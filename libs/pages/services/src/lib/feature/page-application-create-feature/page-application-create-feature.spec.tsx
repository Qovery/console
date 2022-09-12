import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router'
import PageApplicationCreateFeature from './page-application-create-feature'

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
}))

describe('PageApplicationCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement, debug } = render(
      <Routes location={'/organization/1/project/2/environment/3/services/create'}>
        <Route
          path={'/organization/1/project/2/environment/3/services/create/*'}
          element={<PageApplicationCreateFeature />}
        ></Route>
      </Routes>
    )
    expect(baseElement).toBeTruthy()

    debug()
  })
})
