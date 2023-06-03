const express = require("express");
const router = express.Router();

const { authenticate,upload } = require("../../middlewares/");

const { schemas } = require("../../models/user");
const { validateBody } = require("../../decorators");

const ctrl = require("../../controllers/auth-controller");

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.get("/current", authenticate, ctrl.current);

router.post("/logout", authenticate, ctrl.logout);

router.patch("/",authenticate,validateBody(schemas.subscriptionSchema), ctrl.update);

router.patch("/avatars", authenticate, upload.single("avatar"),ctrl.updateAvatar)

module.exports = router;
