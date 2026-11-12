import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { KedaScalersFields, type KedaScalersFieldsProps } from './keda-scalers-fields'

function TestWrapper({
  configFormat,
  config = '{}',
  advancedEnabled = false,
}: {
  configFormat?: 'yaml' | 'json'
  config?: string
  advancedEnabled?: boolean
}) {
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      scalers: [{ type: 'prometheus', config, configFormat, triggerAuthentication: '' }],
      autoscaling_advanced_enabled: advancedEnabled,
      autoscaling_advanced_yaml: advancedEnabled ? 'restoreToOriginalReplicaCount: true' : '',
    },
  })
  const scalersFieldArray = useFieldArray({ control: methods.control, name: 'scalers' })

  return (
    <FormProvider {...methods}>
      <KedaScalersFields
        control={methods.control as unknown as KedaScalersFieldsProps['control']}
        scalersFieldArray={scalersFieldArray as unknown as KedaScalersFieldsProps['scalersFieldArray']}
      />
    </FormProvider>
  )
}

describe('KedaScalersFields', () => {
  it('should label the scaler configuration as JSON for JSON-based scalers', () => {
    renderWithProviders(<TestWrapper configFormat="json" />)

    expect(screen.getByText('Configuration (JSON)')).toBeInTheDocument()
    expect(screen.getByText('Paste raw JSON for this scaler')).toBeInTheDocument()
  })

  it('should warn when a JSON-based scaler config is no longer a valid JSON object', () => {
    renderWithProviders(<TestWrapper configFormat="json" config='threshold: "100"' />)

    expect(screen.getByText('Not a valid JSON object: this configuration will be saved as YAML')).toBeInTheDocument()
    expect(screen.queryByText('Paste raw JSON for this scaler')).not.toBeInTheDocument()
  })

  it('should label the scaler configuration as YAML by default', () => {
    renderWithProviders(<TestWrapper />)

    expect(screen.getByText('Configuration (YAML)')).toBeInTheDocument()
    expect(screen.getByText('Paste raw YAML for this scaler')).toBeInTheDocument()
  })

  it('should hide the advanced configuration editor by default', () => {
    renderWithProviders(<TestWrapper />)

    expect(screen.getByText('Advanced configuration')).toBeInTheDocument()
    expect(screen.queryByText('Advanced configuration (YAML)')).not.toBeInTheDocument()
  })

  it('should show the advanced configuration editor once toggled on', async () => {
    const { userEvent } = renderWithProviders(<TestWrapper />)

    await userEvent.click(screen.getByRole('switch', { name: 'Advanced configuration' }))

    expect(screen.getByText('Advanced configuration (YAML)')).toBeInTheDocument()
  })

  it('should show the advanced configuration editor when the policy has advanced YAML', () => {
    renderWithProviders(<TestWrapper advancedEnabled />)

    expect(screen.getByText('Advanced configuration (YAML)')).toBeInTheDocument()
  })

  it('should reject a fractional initial cooldown period', async () => {
    const { userEvent } = renderWithProviders(<TestWrapper />)

    await userEvent.type(screen.getByLabelText('Initial Cooldown Period (seconds)'), '1.5')

    expect(await screen.findByText('Must be a whole number of seconds between 0 and 3600')).toBeInTheDocument()
  })
})
