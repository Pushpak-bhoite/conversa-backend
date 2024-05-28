import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: 'pushpakbhoitephotos@gmail.com',
        pass: 'gjgb xulv oujv gtnm'
    }
});
 export default transporter;