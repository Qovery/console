import { type OrganizationCrendentialsResponseListResultsInner } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageOrganizationCredentials } from './page-organization-credentials'

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

describe('PageOrganizationCredentials', () => {
  it('should render', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationCredentials />)
    expect(baseElement).toBeTruthy()
  })

  describe('when there are no credentials', () => {
    it('should render an empty state', () => {
      renderWithProviders(<PageOrganizationCredentials />)
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
      renderWithProviders(<PageOrganizationCredentials />)

      screen.getByText('Credential 1')
      screen.getByText('Credential 2')

      const row = screen.getByText('Credential 1').parentElement?.parentElement?.parentElement
      const buttons = row?.querySelectorAll('button')
      const deleteButton = buttons?.[1]

      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toBeEnabled()
    })

    it('delete button should be disabled if no clusters are associated', () => {
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
      renderWithProviders(<PageOrganizationCredentials />)

      const row = screen.getByText('Credential 1').parentElement?.parentElement?.parentElement
      const deleteButton = row?.querySelectorAll('button')[2] // Delete button is the third button in the row

      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toBeDisabled()
    })
  })
})
