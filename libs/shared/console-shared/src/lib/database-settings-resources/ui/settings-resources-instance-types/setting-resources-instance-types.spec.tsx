import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import SettingsResourcesInstanceTypes, {
  type SettingsResourcesInstanceTypesProps,
} from './setting-resources-instance-types'

const props: SettingsResourcesInstanceTypesProps = {
  databaseInstanceTypes: [
    { label: 'Type 1', value: 'type1' },
    { label: 'Type 2', value: 'type2' },
  ],
  displayWarning: true,
}

describe('SettingsResourcesInstanceTypes', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<SettingsResourcesInstanceTypes {...props} />, {
        defaultValues: {
          instance_type: 'db.t3.medium',
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('renders instance type label', () => {
    renderWithProviders(
      wrapWithReactHookForm(<SettingsResourcesInstanceTypes {...props} />, {
        defaultValues: {
          instance_type: 'db.t3.medium',
        },
      })
    )

    const instanceTypeLabel = screen.getByLabelText('Instance type')
    expect(instanceTypeLabel).toBeInTheDocument()
  })

  it('renders warning banner when displayWarning is true', () => {
    renderWithProviders(
      wrapWithReactHookForm(<SettingsResourcesInstanceTypes {...props} />, {
        defaultValues: {
          instance_type: 'db.t3.medium',
        },
      })
    )
    const warningBanner = screen.getByTestId('settings-resources-instance-types-warning')
    expect(warningBanner).toBeInTheDocument()
  })
})
