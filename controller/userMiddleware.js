const jwt = require("jsonwebtoken");

const User = require("../models/user");
// memeriksa authentikasi
const requireAuth = (req, res, next) => {
  //cek cookies
  const token = req.cookies?.gomart;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        // console.log(err.message);
        next(err);
      } else {
        console.log(decodedToken);
        try {
          // !gak bisa pake then, klo pakai then gak bisa di pass ke next
          const result = await User.findOne({ _id: decodedToken.id });
          // req.userFromToken = object User mongoose
          // tambahkan paramenter di req untuk di teruskan ke authController
          req.userFromToken = result;
          //console.log("periksa =", req.userFromToken);
        } catch {
          err;
          console.log("error when find id from token ", err);
          throw err;
        }
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports = { requireAuth };
