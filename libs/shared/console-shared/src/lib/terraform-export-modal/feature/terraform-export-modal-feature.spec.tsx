import userEvent from '@testing-library/user-event'
import { render, screen } from '__tests__/utils/setup-jest'
import * as environmentDomains from '@qovery/domains/environment'
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
    const { baseElement } = render(<TerraformExportModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call useFetchEnvironmentExportTerraform without secret', async () => {
    render(<TerraformExportModalFeature {...props} />)

    const submitButton = screen.getByRole('button', { name: /export/i })
    await userEvent.click(submitButton)

    expect(useFetchEnvironmentExportTerraformSpy).toHaveBeenCalledWith('project-id', 'environment-id')
  })

  it('should call useFetchEnvironmentExportTerraform with secret', async () => {
    useFetchEnvironmentExportTerraformSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })

    render(<TerraformExportModalFeature {...props} />)

    const submitButton = screen.getByRole('button', { name: /export/i })
    await userEvent.click(submitButton)

    const toggle = screen.getByTestId('input-toggle-button')
    await userEvent.click(toggle)
    screen.getByDisplayValue('true')

    expect(useFetchEnvironmentExportTerraformSpy).toHaveBeenCalledWith('project-id', 'environment-id')
    expect(useFetchEnvironmentExportTerraformSpy('project-id', 'environment-id').mutateAsync).toHaveBeenCalledWith({
      exportSecrets: true,
    })
  })
})
