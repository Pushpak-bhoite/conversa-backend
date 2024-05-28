import express from 'express';
import user from '../models/user.model.js';
import formidable from 'formidable';
import passport from 'passport';
import bcrypt from 'bcrypt';
import generateTokenAndSetCookie from './generateToken.js';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import { error } from 'console';

const router = express.Router();


const base_url = path.join(dirname(fileURLToPath(import.meta.url)), "../")


router.post('/login', async (req, res) => {
    try {
        const is_user = await user.findOne({ email: req.body.email });
        console.log('is_user -->', is_user);

        if (is_user) {
            bcrypt.compare(req.body.password, is_user.password, (err, result) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (result) {
                    console.log('Passwords match! User authenticated.', result);
                    generateTokenAndSetCookie(is_user, res);
                } else {
                    console.log('Passwords do not match! Authentication failed.');
                    return res.status(401).json({ message: 'Invalid password' });
                }
            });
        } else {
            console.log('User not found');
            return res.status(401).json({ message: 'Enter valid email' });
        }
    } catch (error) {
        console.error('Error in auth.routes.js:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// generateTokenAndSetCookie(is_user,res)

router.get('/login', (req, res) => {
    res.status(400).send({ error: "Something went wrong !!!" });
})

router.get('/log-out', (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 })
        res.status(200).json({ message: '*******Youre logged out *******' })
    } catch (error) {
        console.log('error in auth.roiutes.js==>', error)
        res.status(500).json({ "error in auth.roiutes.js==>": error });
    }
})


router.post("/signup", async (req, res) => {
    var form = formidable({
        allowEmptyFiles: true, // Allow empty files
        minFileSize: 0,
    })
    let fields;
    let files;
    let filename;
    try {
        [fields, files] = await form.parse(req);

    } catch (err) {
        console.log(err)
    }
    const hexaPass = await bcrypt.hash(fields.password[0], 10);

    let new_user = new user({
        name: fields.name[0],
        email: fields.email[0],
        password: hexaPass,
        phone_no: fields.phone_no[0],
        username: fields.username[0],
        gender: fields.gender[0],
        dob: fields.dob[0],
        country: fields.country[0],
        type: fields.type[0]
    })
    //new_user.save().then((result) => { res.send("Registration successful") }).catch((err) => res.send(err.message));
    const reg_user = await new_user.save().catch((err) => res.send(err.message));

    // if(reg_user){
    //     res.status(200).json({registration : 'successful'});
    // }

    if (files) {
        const old_path = files.profile_img[0].filepath
        filename = files.profile_img[0].originalFilename
        const folder_path = base_url + "uploads/" + reg_user._id
        if (!fs.existsSync(folder_path)) {
            fs.mkdirSync(folder_path, { recursive: true });
        }
        const file_path = base_url + "uploads/" + reg_user._id + "/" + filename
        fs.copyFile(old_path, file_path, function (err) {
            if (err) throw err
        })

        await user.findByIdAndUpdate(reg_user._id, { profile_img: filename })
            .then((result1) => {
                res.status(200).json({ registration: 'successful' });
            })
            .catch((err) => {
                console.log('error at SIGN UP :', error)
                res.send(err.message)
            });

    }
    else {

    }


})

export default router;