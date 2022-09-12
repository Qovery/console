import PageApplicationCreateFeature from './page-application-create-feature'

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
}))

describe('PageApplicationCreateFeature', () => {
  it('should render successfully', () => {
    // const { baseElement } = render(<PageApplicationCreateFeature />)
    // expect(baseElement).toBeTruthy()
  })
})
