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
  },
  getInvitesByName(db, family_name) {
    return db
      .select("*")
      .from("invites as i")
      .whereRaw("LOWER(family_name) LIKE ?", [`%${family_name.toLowerCase()}%`])
  }
}

module.exports = InvitesService;