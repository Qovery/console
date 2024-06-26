import { parseCmdDocker } from './parse-cmd-docker'

describe('parseCmdDocker function', () => {
  it('should parse a simple command string', () => {
    const cmd = 'docker run -d nginx'
    const result = parseCmdDocker(cmd)
    expect(result).toEqual(['docker', 'run', '-d', 'nginx'])
  })

  it('should handle quoted arguments', () => {
    const cmd = 'docker run -v  "arg arg" "/data:/mnt/data" nginx'
    const result = parseCmdDocker(cmd)
    expect(result).toEqual(['docker', 'run', '-v', '"arg arg"', '/data:/mnt/data', 'nginx'])
  })

  it('should handle operations', () => {
    const cmd = 'docker ps -a'
    const result = parseCmdDocker(cmd)
    expect(result).toEqual(['docker', 'ps', '-a'])
  })

  it('should handle comments', () => {
    const cmd = 'docker run nginx # start nginx container'
    const result = parseCmdDocker(cmd)
    expect(result).toEqual(['docker', 'run', 'nginx', '#', ' start nginx container'])
  })

  it('should handle complex arguments and operations together', () => {
    const cmd = 'docker run -v "/data:/mnt/data" -p 8080:80 nginx "arg arg" # start nginx container'
    const result = parseCmdDocker(cmd)
    expect(result).toEqual([
      'docker',
      'run',
      '-v',
      '/data:/mnt/data',
      '-p',
      '8080:80',
      'nginx',
      '"arg arg"',
      '#',
      ' start nginx container',
    ])
  })
})
