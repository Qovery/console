import { useAuth } from '@console/shared/utils'

///* eslint-disable-next-line */
export interface StepPersonalizeProps {}

export function StepPersonalize(props: StepPersonalizeProps) {
  const { authLogout } = useAuth()

  return (
    <div>
      <h1>Welcome to StepPersonalize!</h1>
      <button onClick={() => authLogout()}>Logout</button>
    </div>
  )
}

export default StepPersonalize
