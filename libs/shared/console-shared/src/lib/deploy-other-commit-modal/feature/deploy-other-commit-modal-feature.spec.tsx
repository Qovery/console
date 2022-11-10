import { render } from '@testing-library/react'
import DeployOtherCommitModalFeature from './deploy-other-commit-modal-feature'

describe('DeployOtherCommitModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeployOtherCommitModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
