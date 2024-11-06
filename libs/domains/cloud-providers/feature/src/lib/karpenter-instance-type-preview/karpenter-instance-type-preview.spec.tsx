import { render } from '@testing-library/react'
import KarpenterInstanceTypePreview from './karpenter-instance-type-preview'

describe('KarpenterInstanceTypePreview', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<KarpenterInstanceTypePreview />)
    expect(baseElement).toBeTruthy()
  })
})
