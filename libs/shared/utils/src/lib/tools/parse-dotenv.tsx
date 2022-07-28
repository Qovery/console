export function parseEnvText(text: string): { [key: string]: string } | null {
  const varArray = text.split('\n')
  const env: { [key: string]: string } = {}
  varArray.forEach((envVar) => {
    const name = envVar.split('=')[0]
    const value = envVar.split('=')[1]
    if (name && value) {
      env[name] = value
    }
  })

  return env
}
