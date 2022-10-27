import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router'
import PagesSettings from './page-settings'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router'),
  Link: 'Link',
  useParams: () => ({ organizationId: '1' }),
}))

describe('PagesSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/settings">
        <Route path="/organization/1/settings/*" element={<PagesSettings />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
