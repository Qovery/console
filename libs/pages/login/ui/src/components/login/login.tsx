interface ILoginProps {
  authLogin: (provider: string) => void
  authLogout: () => void
}

export function Login(props: ILoginProps) {
  const { authLogin, authLogout } = props

  return (
    <div className="bg-violet-50 p-20 h-screen">
      <h2 className="text-3xl font-extrabold text-violet-500 mb-10">Login</h2>
      <ul className="flex">
        <li className="mr-2">
          <button className="bg-violet-500 px-5 py-2 text-white" onClick={() => authLogin('github')}>
            Login Github
          </button>
        </li>
        <li className="mr-2">
          <button className="bg-violet-500 px-5 py-2 text-white" onClick={() => authLogin('Gitlab')}>
            Login Gitlab
          </button>
        </li>
        <li className="mr-2">
          <button className="bg-violet-500 px-5 py-2 text-white" onClick={() => authLogin('bitbucket')}>
            Login Bitbucket
          </button>
        </li>
        <li className="mr-2">
          <button className="bg-violet-300 px-5 py-2 text-white" onClick={() => authLogout()}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  )
}

export default Login
