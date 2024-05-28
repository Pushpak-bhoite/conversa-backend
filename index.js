import dotenv from 'dotenv';
const result = dotenv.config();
  console.error(JSON.stringify(result.error));
import mydb from "./db.js"
import express from 'express'
import bodyParser from "body-parser";
import cors from "cors";
import authRoute from './routes/auth.routes.js';
import msgRoute from './routes/is_logged_in.routes.js';
import forgotPassword from './routes/forgotpass.routes.js';
// ---------Passport---------
import passport from 'passport';
import expressSession from 'express-session';
import { initializingPassport, isAuthenticated } from './routes/passportConfig.js';
// ---------Flash---------
import flash from "express-flash";
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { app, server } from "./socket/server.js";
import NewGroup from './routes/newGroup.routes.js';
import changeUserDetails from './routes/changeUserDetails.routes.js';
import saveImages from './routes/saveImage.routes.js';

// ---------Passport---------
app.use(expressSession({  //this  MV(middleweare) should be before below  two
  secret: "secret", resave: false, saveUninitialized: false
}))



console.log(process.env.IPADDRESS);
app.use(passport.initialize());
app.use(passport.session());

initializingPassport(passport);//PASSPORT=this function working as middleware check it out

// ---------Parsers----------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({origin:'*'}))
const base_url=path.join(dirname(fileURLToPath(import.meta.url)),"../backend/")
console.log(base_url)
app.use('/uploads', express.static(path.join(base_url, 'uploads')));
app.use(flash());
mydb();
const port = 5000;

// Available Routes 


app.get('/', (req, res) => {
  res.send('Hello World !!!!!!');
});

app.use("/api/auth", authRoute)
app.use("/api/is-login", msgRoute)
app.use("/api/forgot-pass", forgotPassword)
app.use("/api/newgroup",NewGroup)
app.use("/api/changeuserdetails",changeUserDetails)
app.use("/api/saveImages",saveImages)

server.listen(port,'0.0.0.0', () => {
  console.log(`http://0.0.0.0:${port}`)
})