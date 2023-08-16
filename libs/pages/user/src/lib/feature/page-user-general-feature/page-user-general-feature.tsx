import { Organization } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser, selectUserSignUp } from '@qovery/domains/user'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/state/store'
import PageUserGeneral from '../../ui/page-user-general/page-user-general'

export const handleSubmit = (data: FieldValues, organization: Organization) => {
  return {
    ...organization,
    logo_url: data['logo_url'],
    name: data['name'],
    description: data['description'],
    website_url: data['website_url'] === '' ? undefined : data['website_url'],
    admin_emails: data['admin_emails'],
  }
}

export function PageUserGeneralFeature() {
  useDocumentTitle('General - User settings')

  const userToken = useSelector(selectUser)
  const user = useSelector(selectUserSignUp)

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  console.log(user)
  console.log(userToken)

  const methods = useForm({
    mode: 'onChange',
  })

  console.log(user)

  useEffect(() => {
    methods.reset({
      firstName: user.first_name,
      lastName: user.last_name,
    })
  }, [methods, user?.first_name, user?.last_name])

  const onSubmit = methods.handleSubmit((data) => {
    if (data) {
      setLoading(true)
      // const cloneOrganization = handleSubmit(data, organization)

      // dispatch(
      //   editOrganization({
      //     organizationId,
      //     data: cloneOrganization,
      //   })
      // )
      //   .unwrap()
      //   .then(() => setLoading(false))
      //   .catch(() => setLoading(false))
    }
  })

  return (
    <FormProvider {...methods}>
      <PageUserGeneral onSubmit={onSubmit} loading={loading} picture={userToken.picture as string} />
    </FormProvider>
  )
}

export default PageUserGeneralFeature
