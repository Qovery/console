jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router'),
  Link: 'Link',
  useParams: () => ({ organizationId: '1' }),
}))

describe('PagesSettings', () => {
  it('should render successfully', () => {
    // const { baseElement } = render(
    //   <Routes location="/organization/1/settings">
    //     <Route path="/organization/1/settings/*" element={<PagesSettings />} />
    //   </Routes>
    // )
    // expect(baseElement).toBeTruthy()
  })
})
