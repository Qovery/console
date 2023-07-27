import { render } from '@testing-library/react'
import TerraformExportModal from './terraform-export-modal'

describe('TerraformExportModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TerraformExportModal />)
    expect(baseElement).toBeTruthy()
  })
})
