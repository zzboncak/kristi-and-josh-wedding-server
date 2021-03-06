const express = require('express');
const { RSVP_OPTIONS, AGE_OPTIONS } = require('../Constants');
const InvitesService = require('../invites/invites-service');
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

    if (rsvp && rsvp !== RSVP_OPTIONS.WILL_ATTEND && rsvp !== RSVP_OPTIONS.DECLINE && rsvp !== RSVP_OPTIONS.NOT_RESPONDED) {
      return res.status(400).json({ error: `The rsvp field needs to be either '${RSVP_OPTIONS.WILL_ATTEND}' or '${RSVP_OPTIONS.DECLINE}' or '${RSVP_OPTIONS.NOT_RESPONDED}'.`})
    }

    const rsvpToSubmit = rsvp ? rsvp : RSVP_OPTIONS.NOT_RESPONDED;

    if (person_age && person_age !== AGE_OPTIONS.ADULT && person_age !== AGE_OPTIONS.CHILD) {
      return res.status(400).json({ error: `The person_age field needs to be either '${AGE_OPTIONS.ADULT}' or '${AGE_OPTIONS.CHILD}'` });
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
  .route("/:keyword")
  .get(jsonBodyParser, (req, res, next) => {
    const keyword = req.params.keyword;
    InvitesService.getInvitesByKeyword(
      req.app.get("db"),
      keyword
    ).then(invites => {
        if (invites.length === 0) {
          return res.status(400).json({ error: "No invites with that keyword" });
        }
        const invite = invites[0];
        return PeopleService.getPeopleByFamilyId(
          req.app.get("db"),
          invite.id
        )
          .then(names => res.json(names))
          .catch(next)
      })
    
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
          return res.status(404).json({ error: "No person found with that ID" });
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
    const { family_id, last_name, first_name, rsvp, person_age, allowed_extra, extra_confirmed } = req.body;
    const nothingToUpdate = !family_id && !last_name && !first_name && !rsvp && !person_age && (allowed_extra === undefined) && !extra_confirmed;

    if (nothingToUpdate) {
      return res.status(400).json({ error: "You need to include either 'family_id' or 'last_name' or 'first_name' or 'rsvp' or 'person_age' or 'allowed_extra' or 'extra_confirmed' to update" });
    }

    if (rsvp && rsvp !== RSVP_OPTIONS.WILL_ATTEND && rsvp !== RSVP_OPTIONS.DECLINE && rsvp !== RSVP_OPTIONS.NOT_RESPONDED) {
      return res.status(400).json({ error: `The rsvp field needs to be either '${RSVP_OPTIONS.WILL_ATTEND}' or '${RSVP_OPTIONS.DECLINE}' or '${RSVP_OPTIONS.NOT_RESPONDED}'.`})
    }

    if (person_age && person_age !== AGE_OPTIONS.ADULT && person_age !== AGE_OPTIONS.CHILD) {
      return res.status(400).json({ error: `The person_age field needs to be either '${AGE_OPTIONS.ADULT}' or '${AGE_OPTIONS.CHILD}'` });
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
          return res.status(404).json({ error: "No person found with that ID" });
        }

        return PeopleService.updatePerson(
          req.app.get("db"),
          id,
          newPerson
        )
          .then((person) => res.json(person[0]))
          .catch(next)
      });
  })

module.exports = peopleRouter;