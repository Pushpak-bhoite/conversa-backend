import user from "../models/user.model.js";
import passport from 'passport'
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from 'bcrypt';

// const bcrypt = require('bcrypt')

export const initializingPassport = (passport) => {
    passport.use(new LocalStrategy({ usernameField: "email", passwordField: 'password', passReqToCallback: true }, async (req, email, password, done) => {
        try {
            const is_user = await user.findOne({ email: email })
            if (!is_user) {
                req.flash('message', 'Ooops user not found ');
                return done(null, false, { message: "wrong credentials" });
            }

            const isMatch = await bcrypt.compare(password, is_user.password);

            if (!isMatch) {
                req.flash('message',' Incorrect password') ;
                return done(null, false, { message: "Incorrect password" });
            }

            return done(null, is_user);
        } catch (error) {
            return done(error, false);
        }

    }))

    // Boiler PLate OR mandatory step
    passport.serializeUser((user, done) => {   //creates user id 
        done(null, user.id);
    })

    passport.deserializeUser(async (id, done) => {      //fids user by id
        try {
            const user = await user.findById(id)
            done(null, user);
        } catch (error) {
            done(error, false);
        }
    });
};

export const isAuthenticated = (req, res, next) => {
    if (req.user) return next();
    // res.redirect("/");
    res.send("isAuthenticated is failed ")
}

