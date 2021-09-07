const express = require('express');
const InvitesService = require("./invites-service");

const invitesRouter = express.Router();
const jsonBodyParser = express.json();

invitesRouter
  .post("", jsonBodyParser, (req, res, next) => {
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
  })

module.exports = invitesRouter;