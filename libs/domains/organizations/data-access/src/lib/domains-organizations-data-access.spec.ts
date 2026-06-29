import { OrganizationMainCallsApi, OrganizationOnboardingStatusEnum } from 'qovery-typescript-axios'
import { mutations, organizations } from './domains-organizations-data-access'

describe('organizations.onboarding', () => {
  it('should return onboarding data', async () => {
    const mockData = { use_cases: 'ephemeral-environments,rde', status: OrganizationOnboardingStatusEnum.IN_PROGRESS }
    jest.spyOn(OrganizationMainCallsApi.prototype, 'getOrganizationOnboarding').mockResolvedValue({ data: mockData } as any)

    const query = organizations.onboarding({ organizationId: 'org-1' })
    const result = await query.queryFn({} as any)

    expect(OrganizationMainCallsApi.prototype.getOrganizationOnboarding).toHaveBeenCalledWith('org-1')
    expect(result).toEqual(mockData)
  })

  it('should have the organizationId in the queryKey', () => {
    const query = organizations.onboarding({ organizationId: 'org-1' })
    expect(query.queryKey).toContain('org-1')
  })
})

describe('mutations.updateOrganizationOnboarding', () => {
  it('should call updateOrganizationOnboarding with correct args', async () => {
    const mockData = { use_cases: 'rde', status: OrganizationOnboardingStatusEnum.DISMISSED }
    jest.spyOn(OrganizationMainCallsApi.prototype, 'updateOrganizationOnboarding').mockResolvedValue({ data: mockData } as any)

    const result = await mutations.updateOrganizationOnboarding({
      organizationId: 'org-1',
      onboardingPatchRequest: { status: OrganizationOnboardingStatusEnum.DISMISSED },
    })

    expect(OrganizationMainCallsApi.prototype.updateOrganizationOnboarding).toHaveBeenCalledWith('org-1', {
      status: OrganizationOnboardingStatusEnum.DISMISSED,
    })
    expect(result).toEqual(mockData)
  })
})
