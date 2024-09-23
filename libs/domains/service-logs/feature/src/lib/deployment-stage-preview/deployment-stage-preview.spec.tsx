import { render } from '@testing-library/react'
import DeploymentStagePreview from './deployment-stage-preview'

describe('DeploymentStagePreview', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentStagePreview />)
    expect(baseElement).toBeTruthy()
  })
})
