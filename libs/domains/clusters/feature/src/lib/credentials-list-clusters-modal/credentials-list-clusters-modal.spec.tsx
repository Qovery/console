import * as Dialog from '@radix-ui/react-dialog'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CredentialsListClustersModal } from './credentials-list-clusters-modal'

describe('CredentialsListClustersModal', () => {
  it('should render the list of clusters', () => {
    renderWithProviders(
      <Dialog.Root>
        <CredentialsListClustersModal
          clusters={[
            {
              id: '1',
              name: 'Cluster 1',
              cloud_provider: 'AWS',
            },
            {
              id: '2',
              name: 'Cluster 2',
              cloud_provider: 'AWS',
            },
          ]}
          onClose={() => void 0}
          credential={{
            id: '1',
            name: 'Credential 1',
            object_type: 'AWS',
            access_key_id: '123',
          }}
          organizationId=""
        />
      </Dialog.Root>
    )

    expect(screen.getByText('Attached clusters (2)')).toBeInTheDocument()
    expect(screen.getByText('Cluster 1')).toBeInTheDocument()
    expect(screen.getByText('Cluster 2')).toBeInTheDocument()
  })
})
