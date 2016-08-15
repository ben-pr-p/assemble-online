'use strict'

const log = require('debug')('assemble:github')
const GitHubApi = require('github')

const username = process.env.GITHUB_USERNAME
const password = process.env.GITHUB_PASSWORD

if (!username) {
  log('Missing GITHUB_USERNAME - exiting...')
  process.exit()
}

if (!password) {
  log('Missing GITHUB_PASSWORD - exiting...')
  process.exit()
}

const github = new GitHubApi({
  debug: true
})

github.authenticate({
  type: 'basic',
  username,
  password
})

module.exports.issue = function (body) {
  github.issues.create({
    user: 'assemble-live',
    repo: 'assemble',
    title: body.problem,
    body: `
      submitter: ${body.user}\n\n
      user agent: ${body['user-agent']}\n\n
      content: ${body.context}
      `,
    labels: ['from-bug-form']
  })
}
