import { renderWithProviders } from '@qovery/shared/util-tests'
import { KarpenterInstanceFilterModal } from './karpenter-instance-filter-modal'

describe('KarpenterInstanceFilterModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<KarpenterInstanceFilterModal onClose={jest.fn()} />)
    expect(baseElement).toBeTruthy()
  })
})
