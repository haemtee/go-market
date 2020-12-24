const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { type: String, required: true, enum: ["admin", "buyer", "seller"] },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    avatar: { type: String },
    store_name: { type: String },
    store_pic: { type: String },
  },
  { timestamps: true }
);

// menjalankan fungsi sebelum (pre) simpan ke database, selain save jg bisa yg lain
// gunakan this  untuk mengacu ke objek yang akan disimpan
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre("updateOne", async function (next) {
  const salt = await bcrypt.genSalt();
  if (this._update.$set.password) {
    this._update.$set.password = await bcrypt.hash(
      this._update.$set.password,
      salt
    );
  }
  next();
});

// membuat method static untuk login user
userSchema.statics.login = async function (username, password) {
  // mencari di database berdasarkan username
  const user = await this.findOne({ username: username });
  // jika user di temukan
  if (user) {
    //check password apakah sesuai
    const auth = await bcrypt.compare(password, user.password);
    //jika password sesuai kembalikan object user
    if (auth) {
      return user;
    }
    // jika tidak sesuai
    throw Error("incorrect Password");
  }
  throw Error("incorrect Username");
};
//Export the model
module.exports = mongoose.model("User", userSchema);
