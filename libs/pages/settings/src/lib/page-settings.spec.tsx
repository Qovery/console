import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import PageSettings from './page-settings'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router'),
  Link: 'Link',
  useParams: () => ({ organizationId: '1' }),
}))

describe('PagesSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/settings/general">
        <Route path="/organization/1/settings/*" element={<PageSettings />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
