import chat from "../models/chat.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import call_history from "../models/call_history.model.js";

async function group_video(details) {
    const cur_date = new Date();
    console.log(details);

    const chat_id = new mongoose.Types.ObjectId(details.ids.sent_to_user_id);
    let chat_user = await chat.findOne({ _id: chat_id });
    let chatid;

    console.log(chat_user);

    if (!chat_user) {
        throw new Error('Chat not found');
    }

    chatid = chat_user._id;
    const sender = new mongoose.Types.ObjectId(details.Local_U_data._id);

    // Get all users from the chat document
    const chat_users = chat_user.users;

    // Create a new call_history document
    const make_video = new call_history({
        chat_id: chatid,
        caller_id: sender,
        members: chat_users,  // Use the retrieved users here
        call_type: "Video",
        startAt: cur_date,
        url_path: details.video_url
    });

    let video = await make_video.save();

    console.log('group video saved ==> ', video);

    // Optionally, you can save a message as well (commented out in your original code)
    // const insert_message = new message({
    //     chat_id: chatid,
    //     sender: sender,
    //     content_type: "message",
    //     message: details.msg,
    //     sentAt: cur_date
    // });

    // let new_message = await insert_message.save().then((data) => {
    //     return data.populate('sender').then((data1) => {
    //         return data1;
    //     });
    // });

    // return { new_message: new_message, chat_users: chat_users };
    return { chat_users: chat_users };
}

export default group_video;
