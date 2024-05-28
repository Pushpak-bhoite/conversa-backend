import message from "../models/messages.model.js";
import chat from "../models/chat.model.js";
import call_history from "../models/call_history.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

async function audio_call(details) {

    const cur_date = new Date();
    const ids = Object.values(details.ids).map(id => new mongoose.Types.ObjectId(id)) 
    let chat_user = await chat.findOne({ users: { $all: ids } });// Finding Chat 
    let chatid;

    if (!chat_user) {
        const create_chat = new chat({
            users: ids
        })

        chat_user = await create_chat.save();
        chat_user = await chat.findOne({ users: { $all: ids } }).populate("users");

        chatid = chat_user._id;
        const make_video = new call_history({
            chat_id: chatid,
            caller_id: details.ids.sent_by_user_id,
            members : ids,
            call_type: "Audio",
            startAt: cur_date,
            url_path :details.video_url
        });

        let video = await make_video.save()
        // console.log(video)
        // let new_message = await insert_message.save().then((data) => { return data.populate('sender').then((data1) => { return data1 }) });
        // return { new_message: new_message, new_chat: chat_user }
    }

    chatid = chat_user._id;
    const make_video = new call_history({
        chat_id: chatid,
        caller_id: details.ids.sent_by_user_id,
        members : ids,
        call_type: "Audio",
        startAt: cur_date,
        url_path :details.video_url
    });

    let video = await make_video.save()

    // console.log(video)
    // let new_message = await insert_message.save().then((data) => { return data.populate('sender').then((data1) => { return data1 }) });
    // return { new_message: new_message }
}

export default audio_call;