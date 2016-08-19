'use strict'

const log = require('debug')('assemble:github')
const GitHubApi = require('github')

const username = process.env.GITHUB_USERNAME
const password = process.env.GITHUB_PASSWORD

let disabled = null

if (!username) {
  disabled = 'Missing GITHUB_USERNAME - exiting...'
  log('Missing GITHUB_USERNAME - disabled...')
}

if (!password) {
  disabled = 'Missing GITHUB_PASSWORD - exiting...'
  log('Missing GITHUB_PASSWORD - disabled...')
}

const github = new GitHubApi({
  debug: true
})

if (!disabled) {
  github.authenticate({
    type: 'basic',
    username,
    password
  })
}

module.exports.issue = function (body) {
  if (disabled) {
    return log('Doing nothing, disabled with message %s', disabled)
  }

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
