import { type Terraform } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useBlueprintUpdate } from '../../hooks/use-blueprint-update/use-blueprint-update'
import { ServiceVersionCell } from './service-version-cell'

jest.mock('../../hooks/use-blueprint-update/use-blueprint-update', () => ({
  useBlueprintUpdate: jest.fn(),
}))

const blueprintService = {
  id: 'service-id',
  name: 'AWS S3 Bucket',
  service_type: 'TERRAFORM',
  serviceType: 'TERRAFORM',
  icon_uri: 'app://qovery-console/s3',
  blueprint_id: 'blueprint-id',
  tag: 'AWS/s3/1.2.3',
  terraform_files_source: {
    git: {
      git_repository: {
        provider: 'GITHUB',
        url: 'https://github.com/qovery-blueprints/s3.git',
        name: 'qovery-blueprints/s3',
      },
    },
  },
} as Terraform

describe('ServiceVersionCell', () => {
  it.each([
    { isUpToDate: true, status: 'Up to date' },
    { isUpToDate: false, status: 'Update available' },
  ])('renders the $status state for a blueprint service', ({ isUpToDate, status }) => {
    jest.mocked(useBlueprintUpdate).mockReturnValue({
      data: { is_up_to_date: isUpToDate, current_tag: 'AWS/s3/2.3.4' },
      isLoading: false,
    } as ReturnType<typeof useBlueprintUpdate>)

    renderWithProviders(<ServiceVersionCell service={blueprintService} />)

    expect(useBlueprintUpdate).toHaveBeenCalledWith({ blueprintId: 'blueprint-id' })
    expect(screen.getByText('qovery-blueprints/s3')).toBeInTheDocument()
    expect(screen.getByText('v2.3.4')).toBeInTheDocument()
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('opens the blueprint update confirmation modal when no input is required', async () => {
    jest.mocked(useBlueprintUpdate).mockReturnValue({
      data: {
        is_up_to_date: false,
        current_tag: 'AWS/s3/1.2.3',
        latest_tag: 'AWS/s3/2.0.0',
        new_required_values: [],
        new_optional_values: [],
        now_required_values: [],
        updated_values: [],
        removed_values: [],
        engine_diff: { updated_values: [] },
      },
      isLoading: false,
    } as ReturnType<typeof useBlueprintUpdate>)

    const { userEvent } = renderWithProviders(<ServiceVersionCell service={blueprintService} />)

    await userEvent.click(screen.getByRole('button', { name: 'Update available' }))

    expect(
      await screen.findByRole('heading', { name: 'AWS S3 Bucket blueprint update from 1.2.3 to 2.0.0' })
    ).toBeInTheDocument()
    expect(
      screen.queryByText('No configuration input is required. Continue to preview the update.')
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview changes' })).toBeInTheDocument()
  })
})
