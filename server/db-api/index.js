'use strict'

/**
 * Methods to write:
 * Room
 *  .create(room)
 *  .get(rId)
 *  .addSession(sessionId)
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
 *  .create(user)
 */

const apisToExpose = 'room session agenda action announcement user'.split(' ')

apisToExpose.forEach(api => {
 module.exports[api] = require('./' + api)
})
