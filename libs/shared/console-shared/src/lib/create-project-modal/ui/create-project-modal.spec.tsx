import { render } from '@testing-library/react'
import CreateProjectModal from './create-project-modal'

describe('CreateProjectModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CreateProjectModal />)
    expect(baseElement).toBeTruthy()
  })
})
