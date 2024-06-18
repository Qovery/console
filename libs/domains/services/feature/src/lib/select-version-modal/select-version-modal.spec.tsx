import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SelectVersionModal } from './select-version-modal'

jest.mock('../hooks/use-helm-charts-versions/use-helm-charts-versions', () => {
  return {
    ...jest.requireActual('../hooks/use-helm-charts-versions/use-helm-charts-versions'),
    useHelmCharts: () => ({
      data: [
        {
          chart_name: 'datadog',
          versions: ['3.66.0', '3.65.3'],
        },
      ],
      isLoading: false,
      isFetched: true,
    }),
  }
})

describe('SelectVersionModal', () => {
  it('should match snapshot', () => {
    const onCancel = jest.fn()
    const onSubmit = jest.fn()
    const { container } = renderWithProviders(
      <SelectVersionModal
        title="Deploy other version"
        description="Type a version to deploy"
        submitLabel="Deploy"
        organizationId="1"
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        For X service
      </SelectVersionModal>
    )
    expect(container).toMatchSnapshot()
  })
  it('should call cancel properly', async () => {
    const onCancel = jest.fn()
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <SelectVersionModal
        title="Deploy other version"
        description="Type a version to deploy"
        submitLabel="Deploy"
        organizationId="1"
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        For X service
      </SelectVersionModal>
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
  it('should call submit properly', async () => {
    const onCancel = jest.fn()
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <SelectVersionModal
        title="Deploy other version"
        description="Type a version to deploy"
        organizationId="1"
        submitLabel="Deploy"
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        For X service
      </SelectVersionModal>
    )
    await userEvent.type(screen.getByRole('textbox'), '1.2.3')
    await userEvent.click(screen.getByRole('button', { name: /deploy/i }))
    expect(onSubmit).toHaveBeenCalledWith('1.2.3')
  })

  it('should match snapshot with helm version', () => {
    const onCancel = jest.fn()
    const onSubmit = jest.fn()
    const { container } = renderWithProviders(
      <SelectVersionModal
        title="Deploy other version"
        description="Type a version to deploy"
        submitLabel="Deploy"
        organizationId="1"
        onCancel={onCancel}
        onSubmit={onSubmit}
        currentVersion="3.66.0"
        repository={{
          repository: { id: '1' },
          chart_name: 'datadog',
        }}
      >
        For X service
      </SelectVersionModal>
    )
    expect(container).toMatchSnapshot()
  })
})
