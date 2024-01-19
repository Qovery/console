import { renderWithProviders } from '@qovery/shared/util-tests'
import { TerraformExportModal } from './terraform-export-modal'

describe('TerraformExportModal', () => {
  it('should match with snapshots', () => {
    const { baseElement } = renderWithProviders(<TerraformExportModal environmentId="111" projectId="111" />)
    expect(baseElement).toMatchSnapshot()
  })
})
