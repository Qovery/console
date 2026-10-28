import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useFormContext } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterRestrictivePermissionsToggle } from './cluster-restrictive-permissions-toggle'

function FormValue() {
  const { watch } = useFormContext()
  return <output data-testid="value-restrictive-permissions">{String(watch('using_restrictive_permissions'))}</output>
}

describe('ClusterRestrictivePermissionsToggle', () => {
  it('uses the provided default value and updates the form value', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <>
          <ClusterRestrictivePermissionsToggle defaultValue={false} />
          <FormValue />
        </>,
        { defaultValues: {} }
      )
    )
    const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })

    expect(toggle).not.toBeChecked()

    await userEvent.click(toggle)

    expect(toggle).toBeChecked()
    expect(screen.getByTestId('value-restrictive-permissions')).toHaveTextContent('true')
  })

  it('uses the edit form value when no default value prop is provided', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ClusterRestrictivePermissionsToggle />, {
        defaultValues: { using_restrictive_permissions: true },
      })
    )

    expect(screen.getByRole('switch', { name: 'Use restrictive permissions' })).toBeChecked()
  })
})
