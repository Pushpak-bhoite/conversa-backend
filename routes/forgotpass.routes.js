import express from 'express';
import bodyParser from 'body-parser';
import  User from '../models/user.model.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import  transporter from './mail.js';


const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.post('/link', async (req, res) => {
    try {
        const  fmail  = req.body.email;
        const user = await User.findOne({ email: fmail }).maxTimeMS(30000); // 30 seconds timeout
        if (!user) {
            throw new Error('User not found');
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetToken = resetToken ;
        req.session.resetToken = resetToken ;
        req.session.email = fmail ; 
        user.resetTokenExpiration = Date.now() + 600000;

        console.log('resetToken',resetToken + "\t" + 'user.resetToken',user.resetToken + "\t" + 'req.session.resetToken',fmail + "\t" + 'req.session.fmail',req.session.fmail + "\t" + 'user.resetTokenExpiration',req.session.fmail)
        await user.save();

        // Create the password reset link
        const resetLink = `http://localhost:3000/reset-pass?resettoken=${resetToken}`;
        // console.log(user.Email);

        const mailOptions = {
            from: 'pushpakbhoitephotos@gmail.com',
            to: fmail,
            subject: 'Password Reset Request',
            html: `<P>Please click on the following link to reset your password: ${resetLink}</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                throw new Error('Failed to send email');
            } else {
                console.log('Email sent: ');
                res.json({ans:" Link has been sent on your email "})
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({'err':'Please enter valid email address'});
    }
});

router.post('/reset', async (req, res) => {
try {
        const { password, confirm_pass, resetToken } = req.body;
        console.log(req.body)
        if (password !== confirm_pass) {
            throw new Error("Passwords do not match");
        }
        const user = await User.findOne({ resetToken: req.body.resetToken });

        if (!user) {
            throw new Error('Invalid or expired reset token');
        }
        console.log('password ',password ,  'resetToken => ', resetToken); 
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        let temp  = user.email ; 
        // console.log("this is before updation ===> "+user );
        await user.save();

        const mailOptions = {
            from: 'pushpakbhoitephotos@gmail.com',
            to: temp,
            subject: 'Password Reset Request',
            html: `<P> Dear sir/mam your password has been reset </p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                throw new Error('Failed to send email');
                res.json({'Error ': 'Failed to send email'})
            } else {
                console.log('Email sent : your password has been updated successful');
                res.send(" link sent on email ")
            }
        });

        res.send(' password updated successful ');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error in resetting the password');
    }
});


export default router;

