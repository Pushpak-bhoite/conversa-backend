import express from 'express';
import protectRoute from './protectRoute.js';

const router = express.Router();

router.get('/check', protectRoute, async (req, res) => {
    // const {message} = req.body;
    // const { id : recieverId } = req.param;
    // const senderId = req.user._id;
    try {
        if (Object.keys(req.user).length > 0) {
            res.json(req.user);
        } else {
            console.log({ message: 'Ooops token expired ' }, '---------------');
            res.json({ message: 'Ooops token expired ' });
        }
    } catch (error) {
        console.log('Error in message.Routes.js');
        res.status(500).json({ error: 'internal server error' });
    }
})

router.post('/reset', async (req, res) => {
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

        console.log('resetToken',resetToken + "\t" + 'user.resetToken',user.resetToken + "\t" + 'req.session.resetToken',req.session.resetToken + "\t" + 'req.session.fmail',req.session.fmail + "\t" + 'user.resetTokenExpiration',req.session.fmail)
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
                res.json({ans:" link sent on email successfully "})
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});



export default router;

