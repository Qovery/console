import { type OrganizationCrendentialsResponseListResultsInner } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageOrganizationCredentialsFeature } from './page-organization-credentials-feature'

let mockCredentials: OrganizationCrendentialsResponseListResultsInner[] = []
jest.mock('@qovery/domains/organizations/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/organizations/feature'),
    useOrganizationCredentials: () => ({
      data: mockCredentials,
      isLoading: false,
    }),
  }
})

describe('PageOrganizationCredentialsFeature', () => {
  it('should render', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationCredentialsFeature />)
    expect(baseElement).toBeTruthy()
  })

  describe('when there are no credentials', () => {
    it('should render an empty state', () => {
      renderWithProviders(<PageOrganizationCredentialsFeature />)
      screen.getByText('All credentials related to your clusters will appear here after creation.')
    })
  })

  describe('when there are credentials', () => {
    it('should render the credentials', () => {
      mockCredentials = [
        {
          credential: {
            id: '1',
            name: 'Credential 1',
            object_type: 'AWS',
            access_key_id: '123',
          },
          clusters: [],
        },
        {
          credential: {
            id: '2',
            name: 'Credential 2',
            object_type: 'GCP',
          },
          clusters: [
            {
              id: '1',
              name: 'Cluster 1',
            },
          ],
        },
      ]
      renderWithProviders(<PageOrganizationCredentialsFeature />)

      screen.getByText('Credential 1')
      screen.getByText('Credential 2')

      const row = screen.getByText('Credential 1').parentElement?.parentElement?.parentElement
      const buttons = row?.querySelectorAll('button')
      const deleteButton = buttons?.[1]

      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toBeEnabled()
    })

    it('delete button should not be displayed only when no clusters are attached', () => {
      mockCredentials = [
        {
          credential: {
            id: '1',
            name: 'Credential 1',
            object_type: 'AWS',
            access_key_id: '123',
          },
          clusters: [
            {
              id: '1',
              name: 'Cluster 1',
            },
          ],
        },
        {
          credential: {
            id: '2',
            name: 'Credential 2',
            object_type: 'GCP',
          },
          clusters: [],
        },
      ]
      renderWithProviders(<PageOrganizationCredentialsFeature />)

      const row = screen.getByText('Credential 1').parentElement?.parentElement?.parentElement
      const deleteButton = row?.querySelectorAll('button')[2] // Delete button is the third button in the row

      expect(deleteButton).toBeUndefined()
    })
  })
})
