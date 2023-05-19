const express = require("express");
const router = express.Router();

 const contactController = require("../../controllers/contacts-controller");
const schemas = require("../../schemas/contact-schemas");
const {validateBody} = require("../../decorators");



router.get("/", (contactController.getAllContacts));

router.get("/:contactId", contactController.getContactById);

router.post("/", validateBody(schemas.contactAddSchema),contactController.addContact);

router.delete("/:contactId", contactController.removeContact);

router.put("/:contactId", validateBody(schemas.contactAddSchema),contactController.updateContact);

module.exports = router;
