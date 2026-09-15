import {
  type PlatformComponentConfigurationPreviewResponse,
  type PlatformTemplateComponentResponse,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PlatformComponentConfiguration } from './platform-component-configuration'

const component: PlatformTemplateComponentResponse = {
  key: 'log-storage',
  kind: 'HELM',
  description: 'Stores platform logs.',
  fields: [
    {
      key: 'storage',
      type: 'string',
      required: true,
      defaultValue: 'persistent-volume',
      label: 'Storage',
      sensitive: false,
      constraints: { allowedValues: ['persistent-volume', 'object-storage'] },
    },
  ],
}

const preview: PlatformComponentConfigurationPreviewResponse = {
  clusterId: 'cluster-id',
  componentKey: component.key,
  fields: component.fields,
  requirements: [],
  componentBindings: [],
  violations: [],
}

const defaultProps = {
  component,
  preview,
  profileConfig: {},
  clusterInputs: {},
  hasPreviewError: false,
  isFetching: false,
  isSaving: false,
  onProfileConfigChange: jest.fn(),
  onClusterInputChange: jest.fn(),
  onSave: jest.fn(),
}

describe('PlatformComponentConfiguration', () => {
  it('keeps contextual object fields mounted while the next preview is pending', async () => {
    jest.useFakeTimers()
    const fields = [
      {
        key: 'ami',
        label: 'AMI',
        type: 'object' as const,
        required: true,
        sensitive: false,
        fields: [
          { key: 'id', label: 'AMI ID', type: 'string' as const, required: true, sensitive: false, constraints: {} },
        ],
      },
    ]
    function Editor() {
      const [pending, setPending] = useState(false)
      const [config, setConfig] = useState<Record<string, unknown>>({ ami: { id: 'ami-123' } })
      return (
        <PlatformComponentConfiguration
          {...defaultProps}
          preview={pending ? undefined : { ...preview, fields }}
          isFetching={pending}
          profileConfig={config}
          onProfileConfigChange={(key, value) => {
            setConfig({ [key]: value })
            setPending(true)
          }}
        />
      )
    }
    const { userEvent } = renderWithProviders(<Editor />)
    const input = screen.getByRole('textbox', { name: 'AMI ID' })
    await userEvent.type(input, '45')
    expect(screen.getByRole('textbox', { name: 'AMI ID' })).toBe(input)
    expect(input).toHaveFocus()
    expect(input).toHaveValue('ami-12345')
    expect(screen.getByRole('button', { name: 'Save configuration' })).toBeDisabled()
    jest.useRealTimers()
  })

  it('allows saving a valid configuration without showing a ready status', () => {
    renderWithProviders(<PlatformComponentConfiguration {...defaultProps} />)

    expect(screen.queryByText('Ready')).not.toBeInTheDocument()
    expect(screen.getByText('persistent-volume')).toBeInTheDocument()
    expect(screen.queryByText('Cluster inputs')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save configuration' })).toBeEnabled()
  })

  it('uses contextual field choices returned by the preview', () => {
    renderWithProviders(
      <PlatformComponentConfiguration
        {...defaultProps}
        preview={{
          ...preview,
          fields: [
            {
              ...component.fields[0],
              constraints: { allowedValues: ['persistent-volume', 'gcs'] },
            },
          ],
        }}
      />
    )

    selectEvent.openMenu(screen.getByLabelText('Storage'))

    expect(screen.getByRole('option', { name: 'gcs' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'object-storage' })).not.toBeInTheDocument()
  })

  it('keeps saving disabled until a resolver preview is available', () => {
    renderWithProviders(<PlatformComponentConfiguration {...defaultProps} preview={undefined} />)

    expect(screen.getByText('persistent-volume')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save configuration' })).toBeDisabled()
  })

  it('does not show a ready status on resolved cluster inputs', () => {
    renderWithProviders(
      <PlatformComponentConfiguration
        {...defaultProps}
        preview={{
          ...preview,
          requirements: [
            {
              key: 'endpoint',
              type: 'string',
              scope: 'CLUSTER',
              label: 'Endpoint',
              required: true,
              sensitive: false,
              constraints: {},
              status: 'READY',
            },
          ],
        }}
      />
    )

    expect(screen.getByText('Cluster inputs')).toBeInTheDocument()
    expect(screen.queryByText('Ready')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save configuration' })).toBeEnabled()
  })

  it('renders resolver requirements for a component without catalog fields', () => {
    renderWithProviders(
      <PlatformComponentConfiguration
        {...defaultProps}
        component={{ ...component, fields: [] }}
        preview={{
          ...preview,
          fields: [],
          requirements: [
            {
              key: 'bucket',
              type: 'string',
              scope: 'CLUSTER',
              label: 'Bucket',
              required: true,
              sensitive: false,
              constraints: {},
              status: 'MISSING',
            },
          ],
        }}
      />
    )

    expect(screen.getByText('Cluster inputs')).toBeInTheDocument()
    expect(screen.getByLabelText('Bucket')).toBeInTheDocument()
    expect(screen.queryByText('This component does not require any configuration.')).not.toBeInTheDocument()
  })

  it('surfaces a preview failure and prevents saving', () => {
    renderWithProviders(<PlatformComponentConfiguration {...defaultProps} preview={undefined} hasPreviewError={true} />)

    expect(screen.getByText('Configuration could not be checked')).toBeInTheDocument()
    expect(screen.getByText('Refresh the page and try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save configuration' })).toBeDisabled()
  })

  it('renders missing cluster requirements and prevents saving', () => {
    renderWithProviders(
      <PlatformComponentConfiguration
        {...defaultProps}
        preview={{
          ...preview,
          requirements: [
            {
              key: 'endpoint',
              type: 'string',
              scope: 'CLUSTER',
              label: 'Endpoint',
              required: true,
              sensitive: false,
              constraints: {},
              status: 'MISSING',
            },
            {
              key: 'access-key',
              type: 'string',
              scope: 'CLUSTER',
              label: 'Access key',
              required: true,
              sensitive: true,
              constraints: {},
              status: 'MISSING',
            },
          ],
          violations: [{ code: 'missing', fieldPath: 'clusterInputs.endpoint', message: 'Endpoint is required.' }],
        }}
      />
    )

    expect(screen.getByText('Cluster inputs')).toBeInTheDocument()
    expect(screen.getAllByText('Action required')).toHaveLength(3)
    expect(screen.getByText('Endpoint is required.')).toBeInTheDocument()
    expect(screen.getByLabelText('Access key')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Save configuration' })).toBeDisabled()
  })

  it('displays component bindings supplied by the resolver', () => {
    renderWithProviders(
      <PlatformComponentConfiguration
        {...defaultProps}
        preview={{
          ...preview,
          componentBindings: [{ input: 'bucket', fromComponent: 'bucket-provisioner', output: 'name' }],
        }}
      />
    )

    expect(screen.getByText('Managed component bindings')).toBeInTheDocument()
    expect(screen.getByText('Bucket from Bucket provisioner (Name)')).toBeInTheDocument()
  })
})

it('hides fields from both the catalog and resolved schema while keeping their validation errors visible', () => {
  const isFieldVisible = () => false
  const { unmount } = renderWithProviders(
    <PlatformComponentConfiguration {...defaultProps} preview={undefined} isFieldVisible={isFieldVisible} />
  )
  expect(screen.queryByText('Storage')).not.toBeInTheDocument()
  unmount()
  renderWithProviders(
    <PlatformComponentConfiguration
      {...defaultProps}
      isFieldVisible={isFieldVisible}
      preview={{
        ...preview,
        violations: [
          { code: 'INVALID_VALUE', fieldPath: 'storage', message: 'Fix the pool configuration before saving.' },
        ],
      }}
    />
  )
  expect(screen.queryByText('Storage')).not.toBeInTheDocument()
  expect(screen.getByText('Fix the pool configuration before saving.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Save configuration' })).toBeDisabled()
})
