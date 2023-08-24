import { getByText, render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/shared/factories'
import AboutGit, { type AboutGitProps } from './about-git'

const mockApplication = applicationFactoryMock(1)[0]

mockApplication.git_repository = {
  deployed_commit_id: '1234567890',
  branch: 'master',
  url: 'url',
  name: 'name',
}
mockApplication.commits = {
  loadingStatus: 'loaded',
  items: [
    {
      git_commit_id: '1234567890',
      message: 'message',
      author_name: 'author',
      tag: 'tag',
      created_at: '2021-01-01',
    },
  ],
}

const props: AboutGitProps = {
  application: mockApplication,
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ applicationId: mockApplication.id }),
}))

jest.mock('@qovery/domains/application', () => {
  return {
    ...jest.requireActual('@qovery/domains/application'),
    getApplicationsState: () => ({
      loadingStatus: 'loaded',
      ids: [mockApplication.id],
      entities: {
        [mockApplication.id]: mockApplication,
      },
      error: null,
    }),
    selectApplicationById: () => mockApplication,
  }
})

describe('AboutGit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutGit {...props} />)
    expect(baseElement).toBeTruthy()
  })
  it('should render the desired informations', () => {
    const { baseElement } = render(<AboutGit {...props} />)

    getByText(baseElement, mockApplication.git_repository?.branch || '')
    getByText(baseElement, mockApplication.git_repository?.deployed_commit_id?.substring(0, 7) || '')
    getByText(baseElement, mockApplication.git_repository?.name || '')
  })
})
