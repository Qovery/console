import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { postUserSignUp, selectUser, selectUserSignUp } from '@qovery/domains/user'
import { IconEnum } from '@qovery/shared/enums'
import { ToastEnum } from '@qovery/shared/toast'
import { Icon, toast } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/state/store'
import PageUserGeneral from '../../ui/page-user-general/page-user-general'

export function PageUserGeneralFeature() {
  useDocumentTitle('General - Account settings')

  const userToken = useSelector(selectUser)
  const user = useSelector(selectUserSignUp)

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.user_email,
      account: userToken.sub,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data) {
      setLoading(true)

      dispatch(
        postUserSignUp({
          ...user,
          first_name: data['firstName'],
          last_name: data['lastName'],
          user_email: data['email'],
        })
      )
        .unwrap()
        .then(() => toast(ToastEnum.SUCCESS, 'User updated'))
        .finally(() => setLoading(false))
    }
  })

  const userGitProvider = userToken.sub?.includes('Gitlab') ? 'gitlab' : userToken.sub?.split('|')[0]

  const accountOptions = [
    {
      label: `${userToken.email} (${userGitProvider})`,
      value: userToken.sub || '',
      icon: <Icon name={userGitProvider?.toUpperCase() as IconEnum} className="w-4" />,
    },
  ]

  return (
    <FormProvider {...methods}>
      <PageUserGeneral
        onSubmit={onSubmit}
        loading={loading}
        picture={userToken.picture as string}
        accountOptions={accountOptions}
      />
    </FormProvider>
  )
}

export default PageUserGeneralFeature
