import chat from "../models/chat.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import call_history from "../models/call_history.model.js";

async function group_audio(details) {
    const cur_date = new Date();

    const chat_id = new mongoose.Types.ObjectId(details.ids.sent_to_user_id);
    let chat_user = await chat.findOne({ _id: chat_id });
    let chatid;

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
        call_type: "Audio",
        startAt: cur_date,
        url_path: details.video_url
    });

    let video = await make_video.save();
    return { chat_users: chat_users };
}

export default group_audio;
