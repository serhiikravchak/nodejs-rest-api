const express = require("express");
const router = express.Router();

const contactController = require("../../controllers/contacts-controller");
const { schemas } = require("../../models/contact");
const { validateBody } = require("../../decorators");
const {isValidId}= require("../../middlewares")

router.get("/", contactController.getAllContacts);

router.get("/:contactId", isValidId, contactController.getContactById);

router.post(
  "/",
  validateBody(schemas.contactAddSchema),
  contactController.addContact,
);

router.delete("/:contactId",isValidId, contactController.removeContact);

router.put(
  "/:contactId",
  isValidId,
  validateBody(schemas.contactAddSchema),
  contactController.updateContact
);

router.patch(
  "/:contactId/favorite",
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  contactController.updateStatusContact
);

module.exports = router;
