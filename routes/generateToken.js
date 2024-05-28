import jwt from 'jsonwebtoken'

const generateTokenAndSetCookie = (user, res) => {
    let userId = user._id

    const token = jwt.sign(
        { userId },
        "secrete",  //process.env.secrete
        { expiresIn: '15d' }
    );

    user.password = undefined;
    let user_data = user.toObject();
    user_data.u_id = token;
    const options = {
        maxAge: 15 * 24 * 60 * 60 * 1000,//MS
        httpOnly: true,//prevent XSS attacks creoss-site Scripting attacks 
        sameSite: 'strict',
        // secure: true //CSRF attacks
    }
    try {
        res.status(200).cookie('jwt', token, options).json({
            user_data
        });
    } catch (error) {
        res.json({ 'error in generate tocken ': error });
    }

};

export default generateTokenAndSetCookie;