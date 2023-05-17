const express = require("express");

const { HttpError } = require("../../helpers");
const router = express.Router();
const contactsService = require("../../models/contacts");
const Joi = require("joi");

const contactAddSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

router.get("/", async (req, res, next) => {
  try {
    const result = await contactsService.listContacts();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactsService.getContactById(contactId);
    if (!result) {
      throw HttpError(404);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = contactAddSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "missing required name field");
    }
    const result = await contactsService.addContact(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const {contactId}=req.params;
    const result = await contactsService.removeContact(contactId);
    if (!result) {
      throw HttpError(404);
    }
    res.json({
      message: "contact deleted"
    })
  } catch (error) {
    next(error)
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { error } = contactAddSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "missing fields");
    }
    const { contactId } = req.params;
    const result = await contactsService.updateContact(contactId, req.body);
    if (!result) {
      throw HttpError(404);
    }
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
