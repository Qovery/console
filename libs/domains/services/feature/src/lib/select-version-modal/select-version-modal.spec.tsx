import { type ContainerSource } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SelectVersionModal } from './select-version-modal'

const containerSource: ContainerSource = {
  image_name: 'datadog',
  registry: {
    id: 'registry-1',
    kind: 'DOCKER_HUB',
    name: 'my-registry',
    url: 'https://my-registry.com',
  },
  tag: '2',
}

jest.mock('../hooks/use-helm-charts-versions/use-helm-charts-versions', () => {
  return {
    ...jest.requireActual('../hooks/use-helm-charts-versions/use-helm-charts-versions'),
    useHelmChartsVersions: () => ({
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

jest.mock('@qovery/domains/organizations/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/organizations/feature'),
    useContainerVersions: () => ({
      data: [
        {
          image_name: 'datadog',
          versions: ['1.2.3', '1.2.4'],
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
        containerSource={containerSource}
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
        containerSource={containerSource}
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
        containerSource={containerSource}
        submitLabel="Deploy"
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        For X service
      </SelectVersionModal>
    )
    await selectEvent.select(screen.getByLabelText('Version'), '1.2.3', {
      container: document.body,
    })
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
          repository: { id: '1', name: 'my-repository', url: 'https://my-helm-repository.com' },
          chart_name: 'datadog',
          chart_version: '2',
        }}
      >
        For X service
      </SelectVersionModal>
    )
    expect(container).toMatchSnapshot()
  })

  it('should call submit properly with helm version', async () => {
    const onCancel = jest.fn()
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <SelectVersionModal
        title="Deploy other version"
        description="Type a version to deploy"
        organizationId="1"
        repository={{
          repository: { id: '1', name: 'my-repository', url: 'https://my-helm-repository.com' },
          chart_name: 'datadog',
          chart_version: '2',
        }}
        submitLabel="Deploy"
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        For X service
      </SelectVersionModal>
    )
    await selectEvent.select(screen.getByLabelText('Version'), '3.65.3', {
      container: document.body,
    })
    await userEvent.click(screen.getByRole('button', { name: /deploy/i }))
    expect(onSubmit).toHaveBeenCalledWith('3.65.3')
  })
})
