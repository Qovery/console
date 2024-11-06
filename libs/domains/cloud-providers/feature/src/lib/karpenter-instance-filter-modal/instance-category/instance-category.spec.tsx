import { type ClusterInstanceAttributes } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { InstanceCategory } from './instance-category'

const mockAttributes: ClusterInstanceAttributes[] = [
  { instance_family: 't3' },
  { instance_family: 't3a' },
  { instance_family: 't4g' },
]

const WrapperComponent = ({ children, defaultValues = {} }) => {
  const methods = useForm({ defaultValues })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('InstanceCategory', () => {
  it('should render successfully with basic props', () => {
    const { baseElement } = renderWithProviders(
      <WrapperComponent>
        <InstanceCategory title="t" attributes={mockAttributes} />
      </WrapperComponent>
    )

    expect(baseElement).toBeTruthy()
    expect(screen.getByText('T - General Purpose')).toBeInTheDocument()
  })

  it('should render all instance families in collapsed state', () => {
    renderWithProviders(
      <WrapperComponent>
        <InstanceCategory title="t" attributes={mockAttributes} />
      </WrapperComponent>
    )

    mockAttributes.forEach((attr) => {
      expect(screen.queryByText(attr.instance_family!)).not.toBeInTheDocument()
    })
  })

  it('should expand and show instance families when clicked', async () => {
    const { userEvent } = renderWithProviders(
      <WrapperComponent>
        <InstanceCategory title="t" attributes={mockAttributes} />
      </WrapperComponent>
    )

    await userEvent.click(screen.getByText('T - General Purpose'))

    mockAttributes.forEach((attr) => {
      expect(screen.getByText(attr.instance_family!)).toBeInTheDocument()
    })
  })

  it('should handle checkbox selection states correctly', async () => {
    const { userEvent, container } = renderWithProviders(
      <WrapperComponent defaultValues={{ categories: { t: [] } }}>
        <InstanceCategory title="t" attributes={mockAttributes} />
      </WrapperComponent>
    )

    const mainCheckbox = container.querySelector('input[name="t"]')
    await userEvent.click(mainCheckbox!)
    await userEvent.click(screen.getByText('T - General Purpose'))

    const childCheckboxes = container.querySelectorAll('input[type="checkbox"]')
    childCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked()
    })
  })
})
