import { useNavigate } from '@tanstack/react-router'
import { type BlueprintUpdateResponse } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintUpdateBadge } from './blueprint-update-badge'

const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn(),
}))

const service = {
  id: 'service-id',
  name: 'AWS MySQL',
  environment: { id: 'environment-id' },
  service_type: 'TERRAFORM',
  serviceType: 'TERRAFORM',
} as AnyService

const upToDateBlueprintUpdate = {
  is_up_to_date: true,
  current_tag: 'AWS/mysql/8/1.2.3',
  latest_tag: 'AWS/mysql/8/1.2.3',
  new_required_values: [],
  new_optional_values: [],
  now_required_values: [],
  updated_values: [],
  removed_values: [],
  engine_diff: { updated_values: [] },
} satisfies BlueprintUpdateResponse

describe('BlueprintUpdateBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  it('renders the up-to-date state', () => {
    renderWithProviders(
      <BlueprintUpdateBadge
        blueprintUpdate={upToDateBlueprintUpdate}
        organizationId="organization-id"
        projectId="project-id"
        service={service}
      />
    )

    expect(screen.getByText('Up to date')).toBeInTheDocument()
  })

  it('navigates to the review flow using the service identifiers', async () => {
    const { userEvent } = renderWithProviders(
      <BlueprintUpdateBadge
        blueprintUpdate={{
          ...upToDateBlueprintUpdate,
          is_up_to_date: false,
          updated_values: [
            {
              name: 'multi_az',
              current_default_value: 'false',
              new_default_value: 'true',
              current_value: 'false',
              type: { type: 'bool' },
              allowed_values: null,
              is_secret: false,
            },
          ],
        }}
        organizationId="organization-id"
        projectId="project-id"
        service={service}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Update available' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint',
      params: {
        organizationId: 'organization-id',
        projectId: 'project-id',
        environmentId: 'environment-id',
        serviceId: 'service-id',
      },
    })
  })
})
