export interface InviteDetailsProps {
  user_name?: string
  organization_name?: string
}

export function InviteDetails(props: InviteDetailsProps) {
  const { user_name = '', organization_name = '' } = props

  return (
    <div>
      <p>{user_name} has invited you to join the organization</p>
      <h3>{organization_name}</h3>
    </div>
  )
}

export default InviteDetails
