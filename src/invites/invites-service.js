const xss = require('xss');

const InvitesService = {
  insertInvite(db, invite) {
    return db
      .insert(invite)
      .into("invites")
      .returning("*")
      .then(([invite]) => invite)
  },
  getInvites(db) {
    return db
      .select("*")
      .from("invites")
  }
}

module.exports = InvitesService;