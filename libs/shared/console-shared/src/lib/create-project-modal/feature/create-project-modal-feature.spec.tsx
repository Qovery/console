import { render } from '@testing-library/react'
import CreateProjectModalFeature from './create-project-modal-feature'

describe('CreateProjectModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CreateProjectModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
