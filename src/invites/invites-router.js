const express = require('express');
const InvitesService = require("./invites-service");

const invitesRouter = express.Router();
const jsonBodyParser = express.json();

invitesRouter
  .route("/")
  .get(jsonBodyParser, (req, res, next) => {
    InvitesService
      .getInvites(req.app.get('db'))
      .then(response => res.json(response))
      .catch(next)

  })
  .post(jsonBodyParser, (req, res, next) => {
    const { family_name, head_of_house } = req.body;

    if (!family_name) {
      return res.status(400).json({
        error: "Missing 'family_name' in request body"
      });
    }

    // use invites service to insert new invite to db
    InvitesService.insertInvite(
      req.app.get('db'),
      {
        family_name,
        head_of_house
      }
    )
      .then(invite => {
        if (!invite) {
          return res.status(400).json({ error: "Something went wrong" })
        }

        res.status(201).json(invite)
      })
      .catch(next)
  });

invitesRouter
  .route("/:family_name")
  .get(jsonBodyParser, (req, res, next) => {
    const family_name = req.params.family_name;
    InvitesService.getInvitesByName(
      req.app.get("db"),
      family_name
    )
      .then(names => res.json(names))
      .catch(next)
  });

invitesRouter
  .route("/delete/:id")
  .delete(jsonBodyParser, (req, res, next) => {
    const id = req.params.id;

    InvitesService.getInviteById(
      req.app.get("db"),
      id
    )
      .then(invite => {
        if (!invite) {
          return res.status(400).json({ error: "No invite found with that ID" });
        }

        return InvitesService.deleteInviteById(
          req.app.get("db"),
          id
        )
          .then(() => res.status(204).end())
          .catch(next)
      })

    
  });

module.exports = invitesRouter;