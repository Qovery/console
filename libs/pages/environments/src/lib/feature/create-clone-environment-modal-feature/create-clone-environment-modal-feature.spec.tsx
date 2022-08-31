import { render } from '@testing-library/react'
import CreateCloneEnvironmentModalFeature from './create-clone-environment-modal-feature'

describe('CreateCloneEnvironmentModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CreateCloneEnvironmentModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
