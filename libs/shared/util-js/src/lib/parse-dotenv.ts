export function parseEnvText(text: string): { [key: string]: string } | null {
  const varArray = text.split('\n')
  const env: { [key: string]: string } = {}
  varArray.forEach((envVar) => {
    const [name, ...rest] = envVar.split('=')
    const value = rest.join('=')
    if (name && value) {
      env[name] = value
    }
  })

  return env
}
