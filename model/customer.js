const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const customerSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  name:String,
  role: { type: String, default:"CUSTOMER" },
  tokens: [{ token: String }],
});

customerSchema.statics.loginWithEmailAndPassword = async (credential) => {
  try {
    const user = await SuperAdmin.findOne({ email: credential.email });
    if (!user) {
      throw new Error("Loging Error");
    }

    if (user.password != credential.password) {
        throw new Error("Password is not matched");
      }

    return { user };
  } catch (error) {
    return { error: error.message };
  }
};

customerSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.tokens;
  delete userObject.password;

  return userObject;
};

customerSchema.methods.generateToken = async function () {
  const user = this;

  try {
    const token = jwt.sign({ id: user._id }, process.env.SECURE, {
      expiresIn: "1h",
    });
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return { token };
  } catch (error) {
    return { error: error.message };
  }
};

const SuperAdmin = mongoose.model("Customer", customerSchema);
module.exports = SuperAdmin;
