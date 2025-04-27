// routes/auth.js

const router = require("express").Router();

router.get("/test", (req, res) => {
  res.send("Auth route working ✅");
});

module.exports = router;
