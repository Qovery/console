import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { TerraformExportModal } from './terraform-export-modal'

describe('TerraformExportModal', () => {
  it('should match with snapshots', async () => {
    const { baseElement } = renderWithProviders(<TerraformExportModal environmentId="111" projectId="111" />)
    // Wait for the initial form validation to settle
    await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled())
    expect(baseElement).toMatchSnapshot()
  })
})
