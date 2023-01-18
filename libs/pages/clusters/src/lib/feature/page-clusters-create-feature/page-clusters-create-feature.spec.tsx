import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import PageApplicationCreateFeature from './page-application-create-feature'

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ organizationId: '1' }),
}))

describe('PageApplicationCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/clusters/create/general">
        <Route path="/organization/1/clusters/create/*" element={<PageApplicationCreateFeature />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
