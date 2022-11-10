import { render } from '@testing-library/react'
import DeployOtherCommitModal from './deploy-other-commit-modal'

describe('DeployOtherCommitModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeployOtherCommitModal />)
    expect(baseElement).toBeTruthy()
  })
})
