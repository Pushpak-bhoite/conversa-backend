import message from "../models/messages.model.js";
import chat from "../models/chat.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

async function send_message(details) {

    const cur_date = new Date();
    const ids = Object.values(details.ids).map(id => new mongoose.Types.ObjectId(id)) 
    let chat_user = await chat.findOne({ users: { $all: ids } });// Finding Chat 
    console.log(' chat_user======> ',chat_user);
    let chatid;

    if (!chat_user) {
        const create_chat = new chat({
            users: ids
        })

        chat_user = await create_chat.save();
        chat_user = await chat.findOne({ users: { $all: ids } }).populate("users");

        chatid = chat_user._id;
        const insert_message = new message({
            chat_id: chatid,
            sender: details.ids.sent_by_user_id,
            content_type: "message",
            message: details.msg,
            sentAt: cur_date
        });

        let new_message = await insert_message.save().then((data) => { return data.populate('sender').then((data1) => { return data1 }) });
        return { new_message: new_message, new_chat: chat_user }
    }

    chatid = chat_user._id;
    const insert_message = new message({
        chat_id: chatid,
        sender: details.ids.sent_by_user_id,
        content_type: "message",
        message: details.msg,
        sentAt: cur_date
    });

    let new_message = await insert_message.save().then((data) => { return data.populate('sender').then((data1) => { return data1 }) });
    return { new_message: new_message }
}

export default send_message;