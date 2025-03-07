const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/discord", passport.authenticate("discord"));

router.get("/discord/callback", passport.authenticate("discord", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  }), (req, res) => {
    console.log("Discord callback reached");
  });
  

router.get("/logout", (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect("/");
    });
});

module.exports = router;
