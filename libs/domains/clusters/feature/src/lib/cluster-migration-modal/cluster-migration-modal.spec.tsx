import { renderWithProviders } from '@qovery/shared/util-tests'
import ClusterMigrationModal, { type ClusterMigrationModalProps } from './cluster-migration-modal'

describe('ClusterMigrationModal', () => {
  const props: ClusterMigrationModalProps = {
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ClusterMigrationModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ClusterMigrationModal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})
