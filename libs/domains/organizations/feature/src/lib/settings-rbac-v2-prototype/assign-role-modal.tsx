import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Callout, Icon, InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'
import { type Assignment, type Principal, type Role } from './rbac-v2-mock-data'

const DURATIONS = [
  { label: 'Permanent', value: 'permanent' },
  { label: '4 hours', value: '4h' },
  { label: '12 hours', value: '12h' },
  { label: '7 days', value: '7 days' },
]

// Built-in roles first, then custom ones; the icon and description tell them apart
const roleOptions = (roles: Role[]) =>
  [...roles.filter((role) => role.builtIn), ...roles.filter((role) => !role.builtIn)].map((role) => ({
    label: role.name,
    value: role.id,
    searchText: role.name,
    icon: (
      <Icon
        iconName={role.builtIn ? 'shield-check' : 'user-pen'}
        iconStyle="regular"
        className={role.builtIn ? 'text-brand' : 'text-neutral-subtle'}
      />
    ),
    description: role.builtIn ? `Built-in · ${role.description}` : `Custom · ${role.description}`,
  }))

export interface AssignRoleModalProps {
  principal: Principal
  roles: Role[]
  isTarget: boolean
  onClose: () => void
  onSubmit: (assignment: Omit<Assignment, 'id'>) => void
}

export function AssignRoleModal({ principal, roles, isTarget, onClose, onSubmit }: AssignRoleModalProps) {
  const methods = useForm<{ roleId: string; duration: string; justification: string }>({
    mode: 'onChange',
    defaultValues: { roleId: '', duration: 'permanent', justification: '' },
  })
  const duration = methods.watch('duration')

  const submit = methods.handleSubmit((data) => {
    const isTemporary = isTarget && data.duration !== 'permanent'
    onSubmit({
      principalId: principal.id,
      roleId: data.roleId,
      source: 'admin',
      grantedBy: 'u-vincy',
      expiresIn: isTemporary ? data.duration : undefined,
      justification: isTemporary ? data.justification : undefined,
    })
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={`Assign a role to ${principal.name}`}
        description="Roles add up: the new role never removes the ones already held. Roles the member already holds, by hand or through a group, are not listed."
        onSubmit={submit}
        onClose={onClose}
        submitLabel="Assign role"
      >
        <div className="flex flex-col gap-4">
          <Controller
            name="roleId"
            control={methods.control}
            rules={{ required: 'Select a role.' }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                label="Role"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                isSearchable
                // The menu renders inside the modal (no portal) so it scrolls; it has to fit within the modal
                maxMenuHeight={160}
                options={roleOptions(roles)}
              />
            )}
          />
          {isTarget ? (
            <>
              <Controller
                name="duration"
                control={methods.control}
                render={({ field }) => (
                  <InputSelect
                    label="Duration"
                    value={field.value}
                    onChange={field.onChange}
                    options={DURATIONS}
                    hint="Admins can assign any role permanently or for a set time. Qovery removes it at expiry."
                  />
                )}
              />
              {duration !== 'permanent' && (
                <Controller
                  name="justification"
                  control={methods.control}
                  rules={{ required: 'A temporary grant needs a reason.' }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      name={field.name}
                      label="Justification (incident or ticket link)"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />
              )}
            </>
          ) : (
            <Callout.Root color="neutral">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextDescription>
                  In the MVP, assignments are permanent. Temporary access (e.g. on-call) is added and removed by an
                  admin by hand.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
