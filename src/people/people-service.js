const xss = require("xss");

const PeopleService = {
  insertPerson(db, person) {
    return db
      .insert(person)
      .into("people")
      .returning("*")
      .then(([person]) => person);
  },
  getPeople(db) {
    return db.select("*").from("people");
  },
  getPersonById(db, id) {
    return db.select("*").from("people").where({ id }).first();
  },
  getPeopleByFamilyId(db, family_id) {
    return db.select("*").from("people").where({ family_id });
  },
  deletePersonById(db, id) {
    return db("people").where({ id }).del();
  },
  updatePerson(db, id, newPerson) {
    return db("people").where({ id }).update(newPerson, ["*"]);
  }
};

module.exports = PeopleService;
