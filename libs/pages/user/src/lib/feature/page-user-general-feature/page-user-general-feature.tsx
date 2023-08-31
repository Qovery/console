import { FormProvider, useForm } from 'react-hook-form'
import { useAuth } from '@qovery/shared/auth'
import { type IconEnum } from '@qovery/shared/enums'
import { useEditUserAccount, useUserAccount } from '@qovery/shared/iam/feature'
import { Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageUserGeneral from '../../ui/page-user-general/page-user-general'

export function PageUserGeneralFeature() {
  useDocumentTitle('General - Account settings')

  const { user: userToken } = useAuth()
  const { data: user } = useUserAccount()
  const { mutateAsync, isLoading: loading } = useEditUserAccount()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.communication_email ?? '',
      account: userToken?.sub,
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data) {
      await mutateAsync({
        ...user,
        communication_email: data.email,
      })
    }
  })

  const userGitProvider = userToken?.sub?.includes('Gitlab') ? 'gitlab' : userToken?.sub?.split('|')[0]

  const accountOptions = [
    {
      label: `${userToken?.email} (${userGitProvider})`,
      value: userToken?.sub || '',
      icon: <Icon name={userGitProvider?.toUpperCase() as IconEnum} className="w-4" />,
    },
  ]

  return (
    <FormProvider {...methods}>
      <PageUserGeneral
        onSubmit={onSubmit}
        loading={loading}
        picture={user?.profile_picture_url as string}
        accountOptions={accountOptions}
      />
    </FormProvider>
  )
}

export default PageUserGeneralFeature
