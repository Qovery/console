import { render } from '@testing-library/react'
import TerraformExportModalFeature from './terraform-export-modal-feature'

describe('TerraformExportModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TerraformExportModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
