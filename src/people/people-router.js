const express = require('express');
const { RSVP_OPTIONS, AGE_OPTIONS } = require('../Constants');
const PeopleService = require("./people-service");

const peopleRouter = express.Router();
const jsonBodyParser = express.json();

peopleRouter
  .route("/")
  .get(jsonBodyParser, (req, res, next) => {
    PeopleService
      .getPeople(req.app.get('db'))
      .then(response => res.json(response))
      .catch(next)

  })
  .post(jsonBodyParser, (req, res, next) => {
    const { family_id, last_name, first_name, rsvp, person_age, allowed_extra, extra_confirmed} = req.body;
    const requiredFields = [family_id, last_name, first_name, person_age];
    requiredFields.forEach(field => {
      if (!field) {
        return res.status(400).json({ error: "Be sure to include family_id, last_name, first_name, and person_age in the body of the request" });
      }
    });

    const rsvpToSubmit = rsvp ?? RSVP_OPTIONS.NOT_RESPONDED;

    if (person_age && person_age !== AGE_OPTIONS.ADULT && person_age !== AGE_OPTIONS.CHILD) {
      return res.status(400).json({ error: "The person_age field needs to be either 'Adult' or 'Child'" });
    }

    const newPerson = {
      family_id,
      last_name,
      first_name,
      rsvp: rsvpToSubmit,
      person_age,
      allowed_extra,
      extra_confirmed
    }

    PeopleService.insertPerson(
      req.app.get('db'),
      newPerson
    )
      .then(person => {
        if (!person) {
          return res.status(400).json({ error: "Something went wrong" })
        }

        res.status(201).json(person)
      })
      .catch(next)
  });

peopleRouter
  .route("/:family_id")
  .get(jsonBodyParser, (req, res, next) => {
    const family_id = req.params.family_id;
    PeopleService.getPeopleByFamilyId(
      req.app.get("db"),
      family_id
    )
      .then(names => res.json(names))
      .catch(next)
  });

peopleRouter
  .route("/delete/:id")
  .delete(jsonBodyParser, (req, res, next) => {
    const id = req.params.id;

    PeopleService.getPersonById(
      req.app.get("db"),
      id
    )
      .then(person => {
        if (!person) {
          return res.status(400).json({ error: "No person found with that ID" });
        }

        return PeopleService.deletePersonById(
          req.app.get("db"),
          id
        )
          .then(() => res.status(204).end())
          .catch(next)
      })
  });

peopleRouter
  .route("/update/:id")
  .patch(jsonBodyParser, (req, res, next) => {
    const id = req.params.id;
    const { family_id, last_name, first_name, rsvp, person_age, allowed_extra, extra_confirmed} = req.body;
    const nothingToUpdate = !family_id && !last_name && !first_name && !rsvp && !person_age && !allowed_extra && !extra_confirmed;

    if (nothingToUpdate) {
      return res.status(400).json({ error: "You need to include either 'family_id' or 'last_name' or 'first_name' or 'rsvp' or 'person_age' or 'allowed_extra' or 'extra_confirmed' to update" });
    }

    const newPerson = {
      family_id,
      last_name,
      first_name,
      rsvp,
      person_age,
      allowed_extra,
      extra_confirmed
    }

    PeopleService.getPersonById(
      req.app.get("db"),
      id
    )
      .then(person => {
        if (!person) {
          return res.status(400).json({ error: "No person found with that ID" });
        }

        return PeopleService.updatePerson(
          req.app.get("db"),
          id,
          newPerson
        )
          .then(() => res.status(204).end())
          .catch(next)
      });
  })

module.exports = peopleRouter;