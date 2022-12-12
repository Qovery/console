jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
}))

describe('PageDatabaseCreateFeature', () => {
  it('should render successfully', () => {
    // const { baseElement } = render(
    //   <Routes location="/organization/1/project/2/environment/3/services/create/database">
    //     <Route
    //       path="/organization/1/project/2/environment/3/services/create/database/*"
    //       element={<PageDatabaseCreateFeature />}
    //     />
    //   </Routes>
    // )
    // expect(baseElement).toBeTruthy()
  })
})
