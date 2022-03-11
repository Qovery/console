import { useEffect, useState } from 'react'
import { useUser } from '@console/domains/user'
import { StepPersonalize } from '@console/pages/onboarding/ui'
import { useDocumentTitle } from '@console/shared/utils'

const dataTypes = [
  {
    label: 'Personal',
    value: 'personal',
  },
  {
    label: 'Work',
    value: 'work',
  },
  {
    label: 'School',
    value: 'school',
  },
]

export function OnboardingPersonalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')

  const { user, updateUserSignUp } = useUser()

  const [formData, setFormData] = useState<any>({
    first_name: '',
    last_name: '',
    user_email: '',
  })

  useEffect(() => {
    const { email, name } = user

    setFormData({
      first_name: name?.split(' ')[0],
      last_name: name?.split(' ')[1],
      user_email: email,
    })
  }, [user, setFormData])

  const submitForm = () => {
    // updateUserSignUp({
    //   first_name: 'Rémi',
    //   last_name: 'Bonnet',
    // })
  }

  // updateUserSignUp({
  //   first_name: 'Rémi',
  //   last_name: 'Bonnet',
  //   company_name: null,
  //   company_size: null,
  //   current_step: null,
  //   dx_auth: false,
  //   qovery_usage: null,
  //   type_of_use: null,
  //   user_email: null,
  //   user_questions: null,
  //   user_role: null,
  // })
  if (formData.first_name && formData.first_name.length > 0) {
    return <StepPersonalize data={formData} dataTypes={dataTypes} submitForm={submitForm} />
  } else {
    return null
  }
}

export default OnboardingPersonalize
