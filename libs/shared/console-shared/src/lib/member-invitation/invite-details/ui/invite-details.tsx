export interface InviteDetailsProps {
  user_name?: string
  organization_name?: string
}

export function InviteDetails(props: InviteDetailsProps) {
  const { user_name = '', organization_name = '' } = props

  return (
    <p className="text-text-700 font-bold text-xl">
      {user_name} has invited you to join
      <br />
      <strong className="text-2xl">{organization_name}</strong>
    </p>
  )
}

export default InviteDetails
