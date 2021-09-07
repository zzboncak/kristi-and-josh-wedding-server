const express = require("express");
const InvitesService = require("./invites-service");

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
    const { family_name, head_of_house } = req.body;

    if (!family_name) {
      return res.status(400).json({
        error: "Missing 'family_name' in request body"
      });
    }

    InvitesService.insertInvite(req.app.get("db"), {
      family_name,
      head_of_house
    })
      .then((invite) => {
        if (!invite) {
          return res
            .status(400)
            .json({ error: "Something went wrong" });
        }

        res.status(201).json(invite);
      })
      .catch(next);
  });

invitesRouter
  .route("/:family_name")
  .get(jsonBodyParser, (req, res, next) => {
    const family_name = req.params.family_name;
    InvitesService.getInvitesByName(req.app.get("db"), family_name)
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
    const { family_name, head_of_house } = req.body;
    const nothingToUpdate = !family_name && !head_of_house;

    if (nothingToUpdate) {
      return res
        .status(400)
        .json({
          error:
            "You need to include either 'family_name' or 'head_of_house' to update"
        });
    }

    const newInvite = {
      family_name,
      head_of_house
    };

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
          .then(() => res.status(204).end())
          .catch(next);
      }
    );
  });

module.exports = invitesRouter;
