const express = require("express");
const { AGE_OPTIONS, RSVP_OPTIONS } = require("../Constants");
const PeopleService = require("../people/people-service");
const InvitesService = require("./invites-service");
const xss = require("xss");

const invitesRouter = express.Router();
const jsonBodyParser = express.json();

invitesRouter
  .route("/")
  .get(jsonBodyParser, (req, res, next) => {
    InvitesService.getInvites(req.app.get("db"))
      .then((response) => res.json(response))
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { family_name, head_of_house, keyword } = req.body;

    if (!family_name || !head_of_house || !keyword) {
      return res.status(400).json({
        error: "Missing 'family_name' in request body"
      });
    }

    InvitesService.insertInvite(req.app.get("db"), {
      family_name: xss(family_name),
      head_of_house: xss(head_of_house),
      keyword: xss(keyword)
    })
      .then((invite) => {
        if (!invite) {
          return res
            .status(400)
            .json({ error: "Something went wrong" });
        }

        PeopleService.insertPerson(
          req.app.get("db"),
          {
            family_id: invite.id,
            last_name: invite.family_name,
            first_name: invite.head_of_house,
            person_age: AGE_OPTIONS.ADULT,
            rsvp: RSVP_OPTIONS.NOT_RESPONDED
          }
        )
          .then(() => {
            res.status(201).json(invite);
          })
          .catch(next)

      })
      .catch(next);
  });

invitesRouter
  .route("/:keyword")
  .get(jsonBodyParser, (req, res, next) => {
    const keyword = req.params.keyword;
    InvitesService.getInvitesByKeyword(req.app.get("db"), keyword)
      .then((names) => res.json(names))
      .catch(next);
  });

invitesRouter
  .route("/delete/:id")
  .delete(jsonBodyParser, (req, res, next) => {
    const id = req.params.id;

    InvitesService.getInviteById(req.app.get("db"), id).then(
      (invite) => {
        if (!invite) {
          return res
            .status(404)
            .json({ error: "No invite found with that ID" });
        }

        return InvitesService.deleteInviteById(req.app.get("db"), id)
          .then(() => res.status(204).end())
          .catch(next);
      }
    );
  });

invitesRouter
  .route("/update/:id")
  .patch(jsonBodyParser, (req, res, next) => {
    const id = req.params.id;
    const { family_name, head_of_house, keyword, dietary_restrictions, favorite_song, reset_diet, reset_song } = req.body;
    const nothingToUpdate = !family_name && !head_of_house && !keyword && !dietary_restrictions && !favorite_song && (reset_diet === undefined) && (reset_song === undefined);

    if (nothingToUpdate) {
      return res
        .status(400)
        .json({
          error:
            "You need to include either 'family_name' or 'head_of_house' or 'keyword' or 'dietary_restrictions' or 'favorite_song' to update"
        });
    }

    const newInvite = {
      family_name,
      head_of_house,
      keyword,
      dietary_restrictions,
      favorite_song
    };

    if (reset_diet) {
      newInvite.dietary_restrictions = null;
    }
    if (reset_song) {
      newInvite.favorite_song = null;
    }

    InvitesService.getInviteById(req.app.get("db"), id).then(
      (invite) => {
        if (!invite) {
          return res
            .status(404)
            .json({ error: "No invite found with that ID" });
        }

        return InvitesService.updateInvite(
          req.app.get("db"),
          id,
          newInvite
        )
          .then((invite) => res.json(invite[0]))
          .catch(next);
      }
    );
  });

module.exports = invitesRouter;
