const { User } = require("../models/user");
const { HttpError, sendEmail } = require("../helpers");
const { ctrlWrapper } = require("../decorators");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
const { SECRET_KEY, PORT, PROJECT_URL } = process.env;
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const verificationToken = nanoid();
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify Email",
    html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
    avatarURL: newUser.avatarURL,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  console.log(req.params);
  if (!user) {
    throw HttpError(404);
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.json({ message: "Verication successfull" });
};

const resendVerifyEmail = async(req, res) => {
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user) {
      throw HttpError(404);
  }
  if(user.verify){
      throw HttpError(400, "Verification has already been passed")
  }
  
  const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${PROJECT_URL}/api/auth/verify/${user.verificationToken}">Click to verify email</a>`
  };

  await sendEmail(verifyEmail);

  res.json({
      message: "Verify email send"
  })
}

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.verify) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;

  const payload = {
    id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(id, { token });
  res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const current = async (req, res) => {
  const { email, subscription } = req.user;
  if (!email) {
    throw HttpError(401, "Not authorized");
  }
  res.json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(_id, { token: null });
  if (!user) {
    throw HttpError(401);
  }
  res.status(204).json();
};

const update = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    { _id },
    { subscription },
    { new: true }
  );

  if (!updatedUser) {
    throw HttpError(401);
  }

  res.status(200).json(updatedUser);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const imageName = `${_id}_${originalname}`;

  const image = await Jimp.read(tempUpload);
  await image.resize(250, 250).write(tempUpload);

  const resultUpload = path.join(avatarsDir, imageName);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = `${PROJECT_URL}/avatars/${imageName}`;
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  current: ctrlWrapper(current),
  logout: ctrlWrapper(logout),
  update: ctrlWrapper(update),
  updateAvatar: ctrlWrapper(updateAvatar),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
