import { deploymentListMobileColumnClassName } from './mobile-layout'

describe('deploymentListMobileColumnClassName', () => {
  it('keeps the date column, at 60% of the width', () => {
    expect(deploymentListMobileColumnClassName('created_at')).toBe('max-md:!w-[60%] max-md:overflow-hidden')
  })

  it('keeps the status column, at 40% of the width', () => {
    expect(deploymentListMobileColumnClassName('action_status')).toBe('max-md:!w-[40%]')
  })

  it.each(['total_duration', 'auditing_data_origin', 'stages', 'details'])('hides the %s column below md', (id) => {
    expect(deploymentListMobileColumnClassName(id)).toBe('max-md:hidden')
  })
})
