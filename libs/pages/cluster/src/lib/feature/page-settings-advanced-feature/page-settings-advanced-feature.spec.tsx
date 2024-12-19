import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { useEditClusterAdvancedSettings } from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as InitFormValues from './init-form-values/init-form-values'
import PageSettingsAdvancedFeature from './page-settings-advanced-feature'

const mockCluster = clusterFactoryMock(1)[0]
const mockAdvancedSettings: ClusterAdvancedSettings = {
  'loki.log_retention_in_week': 1,
  'aws.vpc.enable_s3_flow_logs': false,
  'load_balancer.size': '-',
  'cloud_provider.container_registry.tags': {},
}

jest.mock('@qovery/domains/clusters/feature', () => {
  const mutateAsync = jest.fn()
  return {
    ...jest.requireActual('@qovery/domains/clusters/feature'),
    useClusterAdvancedSettings: () => ({
      data: mockAdvancedSettings,
    }),
    useDefaultAdvancedSettings: () => ({
      data: {},
    }),
    useEditClusterAdvancedSettings: () => ({
      mutateAsync,
    }),
  }
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', clusterId: mockCluster.id }),
}))

describe('PageSettingsAdvancedFeature', () => {
  it('should edit ClusterAdvancedSettings if form is submitted', async () => {
    const { userEvent, container } = renderWithProviders(<PageSettingsAdvancedFeature />)

    const retentionInput = container.querySelector('textarea[name="loki.log_retention_in_week"]') as Element
    const flowLogsInput = container.querySelector('textarea[name="aws.vpc.enable_s3_flow_logs"]') as Element
    const loadBalancerInput = container.querySelector('textarea[name="load_balancer.size"]') as Element
    const tagsInput = container.querySelector('textarea[name="cloud_provider.container_registry.tags"]') as Element

    fireEvent.change(retentionInput, { target: { value: '' } })
    fireEvent.change(flowLogsInput, { target: { value: '' } })
    fireEvent.change(loadBalancerInput, { target: { value: '' } })
    fireEvent.change(tagsInput, { target: { value: '' } })

    fireEvent.change(retentionInput, { target: { value: '2' } })
    fireEvent.change(flowLogsInput, { target: { value: 'true' } })
    fireEvent.change(loadBalancerInput, { target: { value: '/' } })
    fireEvent.change(tagsInput, { target: { value: '{"test":"test"}' } })

    const button = await screen.findByTestId('submit-button')
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(useEditClusterAdvancedSettings().mutateAsync).toHaveBeenCalledWith({
      clusterId: mockCluster.id,
      organizationId: '1',
      clusterAdvancedSettings: {
        'loki.log_retention_in_week': 2,
        'aws.vpc.enable_s3_flow_logs': true,
        'load_balancer.size': '/',
        'cloud_provider.container_registry.tags': { test: 'test' },
      },
    })
  })

  it('should init the form', async () => {
    const spy = jest.spyOn(InitFormValues, 'initFormValues')
    renderWithProviders(<PageSettingsAdvancedFeature />)
    expect(spy).toHaveBeenCalled()
  })
})
