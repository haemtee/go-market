const jwt = require("jsonwebtoken");

// memeriksa authentikasi
const requireAuth = (req, res, next) => {
  //cek cookies
  const token = req.cookies?.gomart;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        // console.log(err.message);
        next(err);
      } else {
        console.log(decodedToken);
        // tambahkan paramenter di req untuk di teruskan ke authController
        req.decodedToken = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized access" });
  }
};

// const checkUser = (req, res, next) => {
//   const token = req.cookies.gomart;

//   if (token) {
//     jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
//       if (err) {
//         console.log(err.message);
//         next(err);
//       } else {
//         console.log(decodedToken);
//         //let user = await User.findById(decodedToken.id);
//         req.decodedToken = decodedToken;
//         next();
//       }
//     });
//   } else {
//     res.status(401).json({ message: "Unauthorized access" });
//   }
// };

module.exports = { requireAuth };
