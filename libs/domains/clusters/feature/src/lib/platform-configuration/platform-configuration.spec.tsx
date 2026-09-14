import { type PlatformTemplateSummaryResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PlatformConfiguration } from './platform-configuration'

const mockUpdateConfiguration = jest.fn()
const template: PlatformTemplateSummaryResponse = {
  key: 'qovery-cluster-v0',
  version: '0.1.0',
  status: 'PUBLISHED',
  layers: [
    {
      key: 'karpenter',
      mandatory: false,
      enabledByDefault: false,
      components: [
        {
          key: 'karpenter-qovery-configuration',
          kind: 'HELM',
          fields: [
            {
              key: 'diskSizeGiB',
              type: 'number',
              label: 'Disk',
              required: true,
              sensitive: false,
              defaultValue: '50',
              constraints: {},
            },
            {
              key: 'stable',
              type: 'object',
              label: 'Stable',
              required: false,
              sensitive: false,
              fields: [
                {
                  key: 'spotEnabled',
                  type: 'bool',
                  label: 'Spot',
                  required: true,
                  sensitive: false,
                  defaultValue: 'false',
                  constraints: {},
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

jest.mock('./hooks/use-platform-templates', () => ({
  usePlatformTemplates: () => ({ data: [template] }),
}))
jest.mock('./hooks/use-cluster-platform-configuration', () => ({
  useClusterPlatformConfiguration: () => ({
    data: {
      clusterId: 'cluster',
      organizationId: 'organization',
      platform: {
        templateKey: 'qovery-cluster-v0',
        templateVersion: '0.1.0',
        layerSelections: { karpenter: true },
        managedConfig: { 'karpenter-configuration': { nodePools: [{ name: 'demo', spotEnabled: true }] } },
      },
      layers: [],
      clusterInputs: { 'karpenter-configuration': { 'aws.eksClusterName': 'existing-cluster' } },
    },
  }),
}))
jest.mock('./hooks/use-update-cluster-platform-configuration', () => ({
  useUpdateClusterPlatformConfiguration: () => ({ mutate: mockUpdateConfiguration, isLoading: false }),
}))
jest.mock('./hooks/use-platform-component-configuration', () => ({
  usePlatformComponentConfiguration: () => ({ data: undefined, isError: false, isFetching: false }),
}))
jest.mock('./platform-configuration-catalog', () => ({
  PlatformConfigurationCatalog: ({
    onComponentSelect,
    onSave,
  }: {
    onComponentSelect: (key: string) => void
    onSave: () => void
  }) => (
    <>
      <button onClick={() => onComponentSelect('karpenter-qovery-configuration')}>Configure pools</button>
      <button onClick={onSave}>Save layers</button>
    </>
  ),
}))
jest.mock('./platform-component-configuration', () => ({
  PlatformComponentConfiguration: ({ onSave }: { onSave: () => void }) => (
    <button onClick={onSave}>Save component</button>
  ),
}))

describe('PlatformConfiguration save', () => {
  beforeEach(() => mockUpdateConfiguration.mockClear())

  it.each(['component', 'layers'])(
    'persists displayed defaults when saving from %s without changing existing pools',
    async (from) => {
      const { userEvent } = renderWithProviders(
        <PlatformConfiguration
          clusterId="cluster"
          organizationId="organization"
          clusterMode="CUSTOMER_MANAGED"
          cloudProvider="AWS"
        />
      )
      await userEvent.click(screen.getByRole('button', { name: 'Configure pools' }))
      if (from === 'layers') {
        await userEvent.click(screen.getByRole('button', { name: 'Platform layers' }))
      }
      await userEvent.click(screen.getByRole('button', { name: from === 'layers' ? 'Save layers' : 'Save component' }))
      expect(mockUpdateConfiguration).toHaveBeenCalledWith({
        clusterId: 'cluster',
        request: {
          platform: {
            templateKey: 'qovery-cluster-v0',
            templateVersion: '0.1.0',
            layerSelections: { karpenter: true },
            managedConfig: {
              'karpenter-configuration': { nodePools: [{ name: 'demo', spotEnabled: true }] },
              'karpenter-qovery-configuration': { diskSizeGiB: 50, stable: { spotEnabled: false } },
            },
          },
          clusterInputs: { 'karpenter-configuration': { 'aws.eksClusterName': 'existing-cluster' } },
        },
      })
    }
  )
})
