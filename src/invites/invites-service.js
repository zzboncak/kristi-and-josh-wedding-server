const xss = require("xss");

const InvitesService = {
  insertInvite(db, invite) {
    return db
      .insert(invite)
      .into("invites")
      .returning("*")
      .then(([invite]) => invite);
  },
  getInvites(db) {
    return db.select("*").from("invites");
  },
  getInviteById(db, id) {
    return db.select("*").from("invites").where({ id }).first();
  },
  getInvitesByName(db, family_name) {
    return db
      .select("*")
      .from("invites as i")
      .whereRaw("LOWER(family_name) LIKE ?", [
        `%${family_name.toLowerCase()}%`
      ]);
  },
  getInvitesByKeyword(db, keyword) {
    return db
      .select("*")
      .from("invites as i")
      .where({ keyword })
  },
  deleteInviteById(db, id) {
    return db("invites").where({ id }).del();
  },
  updateInvite(db, id, newInvite) {
    return db("invites").where({ id }).update(newInvite, ["*"]);
  }
};

module.exports = InvitesService;
