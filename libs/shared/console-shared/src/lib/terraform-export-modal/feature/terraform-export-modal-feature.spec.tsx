import * as environmentDomains from '@qovery/domains/environment'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import TerraformExportModalFeature from './terraform-export-modal-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectId: 'project-id' }),
}))

const useFetchEnvironmentExportTerraformSpy = jest.spyOn(
  environmentDomains,
  'useFetchEnvironmentExportTerraform'
) as jest.Mock

const props = {
  closeModal: jest.fn(),
  environmentId: 'environment-id',
}

describe('TerraformExportModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<TerraformExportModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call useFetchEnvironmentExportTerraform without secret', async () => {
    const { userEvent } = renderWithProviders(<TerraformExportModalFeature {...props} />)

    const submitButton = screen.getByRole('button', { name: /export/i })
    await userEvent.click(submitButton)

    expect(useFetchEnvironmentExportTerraformSpy).toHaveBeenCalledWith('project-id', 'environment-id')
  })

  it('should call useFetchEnvironmentExportTerraform with secret', async () => {
    useFetchEnvironmentExportTerraformSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })

    const { userEvent } = renderWithProviders(<TerraformExportModalFeature {...props} />)

    const toggle = screen.getByText(/export secrets/i)
    await userEvent.click(toggle)
    screen.getByDisplayValue('true')

    const submitButton = screen.getByRole('button', { name: /export/i })
    await userEvent.click(submitButton)

    expect(useFetchEnvironmentExportTerraformSpy).toHaveBeenCalledWith('project-id', 'environment-id')
    expect(useFetchEnvironmentExportTerraformSpy('project-id', 'environment-id').mutateAsync).toHaveBeenCalledWith({
      exportSecrets: true,
    })
  })
})
