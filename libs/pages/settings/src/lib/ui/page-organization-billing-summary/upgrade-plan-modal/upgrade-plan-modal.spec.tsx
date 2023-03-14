import { render } from '@testing-library/react'
import UpgradePlanModal from './upgrade-plan-modal'

describe('UpgradePlanModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpgradePlanModal />)
    expect(baseElement).toBeTruthy()
  })
})
