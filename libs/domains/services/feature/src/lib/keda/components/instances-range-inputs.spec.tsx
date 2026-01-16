import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { InstancesRangeInputs } from './instances-range-inputs'

function TestWrapper({
  requireMinLessThanMax,
  showMaxField = true,
}: {
  requireMinLessThanMax?: boolean
  showMaxField?: boolean
}) {
  const methods = useForm({
    defaultValues: {
      min_running_instances: 1,
      max_running_instances: 5,
    },
  })

  return (
    <FormProvider {...methods}>
      <form>
        <InstancesRangeInputs
          control={methods.control}
          minInstances={1}
          maxInstances={100}
          minRunningInstances={methods.watch('min_running_instances')}
          showMaxField={showMaxField}
          requireMinLessThanMax={requireMinLessThanMax}
        />
      </form>
    </FormProvider>
  )
}

describe('InstancesRangeInputs', () => {
  it('should render min and max fields', () => {
    renderWithProviders(<TestWrapper />)

    expect(screen.getByLabelText('Instances min')).toBeInTheDocument()
    expect(screen.getByLabelText('Instances max')).toBeInTheDocument()
  })

  it('should render only min field when showMaxField is false', () => {
    renderWithProviders(<TestWrapper showMaxField={false} />)

    expect(screen.getByLabelText('Number of instances')).toBeInTheDocument()
    expect(screen.queryByLabelText('Instances max')).not.toBeInTheDocument()
  })

  it('should render with requireMinLessThanMax enabled', () => {
    renderWithProviders(<TestWrapper requireMinLessThanMax={true} />)

    expect(screen.getByLabelText('Instances min')).toBeInTheDocument()
    expect(screen.getByLabelText('Instances max')).toBeInTheDocument()
  })

  it('should render with requireMinLessThanMax disabled', () => {
    renderWithProviders(<TestWrapper requireMinLessThanMax={false} />)

    expect(screen.getByLabelText('Instances min')).toBeInTheDocument()
    expect(screen.getByLabelText('Instances max')).toBeInTheDocument()
  })
})
