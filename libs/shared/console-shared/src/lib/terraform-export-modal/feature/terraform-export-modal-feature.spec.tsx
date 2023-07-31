import { render, screen } from '__tests__/utils/setup-jest'
import * as environmentDomains from '@qovery/domains/environment'
import TerraformExportModalFeature from './terraform-export-modal-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectId: '1' }),
}))

const useFetchEnvironmentExportTerraformSpy = jest.spyOn(
  environmentDomains,
  'useFetchEnvironmentExportTerraform'
) as jest.Mock

const props = {
  closeModal: jest.fn(),
  environmentId: '1',
}

describe('TerraformExportModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TerraformExportModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call useFetchEnvironmentExportTerraform', () => {
    render(<TerraformExportModalFeature {...props} />)

    const submitButton = screen.getByTestId('submit-button')
    submitButton.click()

    expect(useFetchEnvironmentExportTerraformSpy).toHaveBeenCalledWith('1', '1')
  })
})
