'use strict'

/**
 * Methods to write:
 * Session
 *  .create(session)
 *  .get(sessionId)
 *  .endSession(sessionId)
 *  .addAgendaItem(sessionId, agendaItem)
 *  .addActionItem(sessionId, actionItem)
 *  .addAnnouncement(sessionid, announcement)
 *  .registerUserEnter(sessionId, userId)
 *  .registerUserExit(sessionId, userId)
 * AgendaItem
 *  .create(agendaItem)
 *  .edit(agId, agendaItem)
 *  .delete(agId) *****
 *  .addAnnouncement(agId, announcement)
 *  .addActionItem(agId, actionItem)
 * Announcement
 *  .create(announcement)
 *  .edit(aid, announcement)
 *  .addResponse(aid, response)
 * ActionItem
 *  .create(actionItem)
 *  .edit(acId, actionItem)
 *  .addAssignee(acId, userId)
 * User
 *  .ensure(user)
 */

const apisToExpose = 'session action announcement user'.split(' ')

apisToExpose.forEach(api => {
 module.exports[api] = require('./' + api)
})
