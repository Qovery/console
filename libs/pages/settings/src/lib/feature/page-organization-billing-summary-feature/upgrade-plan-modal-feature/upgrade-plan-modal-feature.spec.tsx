import { render } from '@testing-library/react'
import UpgradePlanModalFeature from './upgrade-plan-modal-feature'

describe('UpgradePlanModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpgradePlanModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
