import download from 'downloadjs'
import { mutations } from '@qovery/domains/environments/data-access'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { TerraformExportModal } from './terraform-export-modal'

jest.mock('downloadjs', () => jest.fn())

describe('TerraformExportModal', () => {
  const archive = new File(['terraform'], 'terraform.zip', { type: 'application/zip' })

  beforeEach(() => {
    jest.spyOn(mutations, 'exportTerraform').mockResolvedValue(archive)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should match with snapshots', async () => {
    const { baseElement } = renderWithProviders(<TerraformExportModal environmentId="111" />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled())
    expect(baseElement).toMatchSnapshot()
  })

  it('should ask for confirmation without an option to export secrets', async () => {
    renderWithProviders(<TerraformExportModal environmentId="111" />)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled())
    expect(screen.getByText(/Secret values will not be exposed\./)).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    expect(mutations.exportTerraform).not.toHaveBeenCalled()
  })

  it('should download the selected environment after confirmation', async () => {
    const { userEvent } = renderWithProviders(<TerraformExportModal environmentId="111" />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled())

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => expect(mutations.exportTerraform).toHaveBeenCalledWith({ environmentId: '111' }))
    expect(download).toHaveBeenCalledWith(archive, 'terraform-manifest-111.zip', 'application/zip')
  })

  it('should not export when cancelled', async () => {
    const { userEvent } = renderWithProviders(<TerraformExportModal environmentId="111" />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mutations.exportTerraform).not.toHaveBeenCalled()
    expect(download).not.toHaveBeenCalled()
  })

  it('should allow retrying a failed export', async () => {
    const error = new Error('Export failed')
    const logError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    jest.mocked(mutations.exportTerraform).mockRejectedValueOnce(error).mockResolvedValueOnce(archive)
    const { userEvent } = renderWithProviders(<TerraformExportModal environmentId="111" />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled())

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => expect(logError).toHaveBeenCalledWith(error))
    expect(download).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Export' }))
    await waitFor(() => expect(download).toHaveBeenCalledWith(archive, 'terraform-manifest-111.zip', 'application/zip'))
  })
})
