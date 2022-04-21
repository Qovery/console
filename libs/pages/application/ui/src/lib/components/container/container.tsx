import { Application } from 'qovery-typescript-axios'
import { useNavigate } from 'react-router'

export interface ContainerProps {
  application: Application
}

export function Container(props: ContainerProps) {
  const { application } = props
  const navigate = useNavigate()

  return (
    <div>
      <button className="mb-2" onClick={() => navigate(-1)}>
        Back
      </button>
      <h1>{application.name}</h1>
    </div>
  )
}

export default Container
