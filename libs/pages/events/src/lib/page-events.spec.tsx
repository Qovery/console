import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import PageEvents from './page-events'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', clusterId: '2' }),
}))

describe('PageEvents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/events/*">
        <Route path="/organization/1/events/general" element={<PageEvents />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
