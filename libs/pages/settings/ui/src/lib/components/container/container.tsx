import { useNavigate } from 'react-router'

export function Container() {
  const navigate = useNavigate()

  return (
    <div>
      <button className="mb-2" onClick={() => navigate(-1)}>
        Back
      </button>
      <h1>Welcome to Settings!</h1>
    </div>
  )
}

export default Container
