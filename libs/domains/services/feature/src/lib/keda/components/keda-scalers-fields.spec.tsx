import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { KedaScalersFields, type KedaScalersFieldsProps } from './keda-scalers-fields'

function TestWrapper({ configFormat, config = '{}' }: { configFormat?: 'yaml' | 'json'; config?: string }) {
  const methods = useForm({
    defaultValues: {
      scalers: [{ type: 'prometheus', config, configFormat, triggerAuthentication: '' }],
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
})
