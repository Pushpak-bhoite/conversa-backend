import message from "../models/messages.model.js";
import chat from "../models/chat.model.js";
import jwt from 'jsonwebtoken';
import mongoose, { mongo } from "mongoose";

async function send_message_group(details){

    const cur_date=new Date();
    console.log(details);
    const group_id=new mongoose.Types.ObjectId(details.ids.sent_to_user_id)
    // const ids=Object.values(details.ids).map(id=>new mongoose.Types.ObjectId(id))
    let chat_user=await chat.findOne({_id:group_id});
    let chatid;

    console.log(chat_user)

    // if(!chat_user){
    //     const create_chat=new chat({
    //         users:ids
    //     }) 

    //     chat_user=await create_chat.save();
    //     chat_user=await chat.findOne({users:{$all:ids}}).populate("users");
        
    //     chatid=chat_user._id;
    // const insert_message=new message({
    //     chat_id:chatid,
    //     sender:details.ids.sent_by_user_id,
    //     content_type:"message",
    //     message:details.msg,
    //     sentAt:cur_date
    // });

    // // let new_message=await insert_message.save();
    // // return {new_message:new_message,new_chat:chat_user}
    // // }

    chatid=chat_user._id;
    const sender=new mongoose.Types.ObjectId(details.ids.sent_by_user_id);

    const chat_users=chat_user.users
    console.log(chat_users)
    const insert_message=new message({
        chat_id:chatid,
        sender:sender,
        content_type:"message",
        message:details.msg,
        sentAt:cur_date
    });

    let new_message=await insert_message.save().then((data)=> {return data.populate('sender').then((data1)=>{return data1})});
    return {new_message:new_message,chat_users:chat_users}
}

export default send_message_group;