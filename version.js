/*
 * Federated Wiki : Node Server
 *
 * Copyright Ward Cunningham and other contributors
 * Licensed under the MIT license.
 * https://github.com/fedwiki/wiki/blob/master/LICENSE.txt
 */

// prints `(console.info()` the version of wiki components we have installed.

import path from 'node:path'
import url from 'node:url'

const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJsonUrl = url.pathToFileURL(packageJsonPath).href
const { default: packageJson } = await import(packageJsonUrl, { with: { type: 'json' } })

const getPackageVersion = packageName => {
  return new Promise(resolve => {
    try {
      // Use dynamic import to load package.json from the main application's working directory
      const packageJsonPath = path.join(process.cwd(), 'node_modules', packageName, 'package.json')
      const packageJsonUrl = url.pathToFileURL(packageJsonPath).href
      import(packageJsonUrl, { with: { type: 'json' } }).then(({ default: packageJson }) => {
        resolve({ [packageName]: packageJson.version })
      })
    } catch (error) {
      console.error(`Error reading package for ${packageName}:`, error)
      resolve({ [packageName]: 'unknown' })
    }
  })
}

const versions = {}

const security = () => {
  return new Promise(resolve => {
    Promise.all(
      Object.keys(packageJson.dependencies)
        .filter(depend => depend.startsWith('wiki-security'))
        .map(key => {
          return getPackageVersion(key)
        }),
    ).then(values => {
      resolve({ security: values.reduce((acc, cV) => Object.assign(acc, cV), {}) })
    })
  })
}

const plugins = () => {
  return new Promise(resolve => {
    Promise.all(
      Object.keys(packageJson.dependencies)
        .filter(depend => depend.startsWith('wiki-plugin'))
        .map(key => {
          return getPackageVersion(key)
        }),
    ).then(values => {
      resolve({ plugins: values.reduce((acc, cV) => Object.assign(acc, cV), {}) })
    })
  })
}

export function version() {
  Promise.all([getPackageVersion('wiki-server'), getPackageVersion('wiki-client'), security(), plugins()]).then(v => {
    Object.assign(versions, { [packageJson.name]: packageJson.version }, ...v)
    console.info(JSON.stringify(versions, null, ' '))
  })
}
