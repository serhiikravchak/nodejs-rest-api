const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");
const Joi = require("joi");

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    avatarURL: {
      type: String,
      required: true,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const registerSchema = Joi.object({
  email: Joi.string().required().pattern(emailRegex),
  password: Joi.string().required().min(6),
  subscription: Joi.string(),
});

const loginSchema = Joi.object({
  email: Joi.string().required().pattern(emailRegex),
  password: Joi.string().required().min(6),
  token: Joi.string().default(null),
});

const subscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const userEmailSchema = Joi.object({
  email: Joi.string().required().pattern(emailRegex),
});

const schemas = {
  registerSchema,
  loginSchema,
  subscriptionSchema,
  userEmailSchema
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
