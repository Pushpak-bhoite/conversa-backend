import message from "../models/messages.model.js";
import chat from "../models/chat.model.js";
import jwt from 'jsonwebtoken';
import mongoose, { mongo } from "mongoose";

async function getSingleGroupMessages(details){

    const cur_date=new Date();
    console.log(details);
    const group_id=new mongoose.Types.ObjectId(details.ids.sent_to_user_id)
    // const ids=Object.values(details.ids).map(id=>new mongoose.Types.ObjectId(id))
    let chat_user=await chat.findOne({_id:group_id});
    let chatid;


    chatid=chat_user._id;
    const sender=new mongoose.Types.ObjectId(details.ids.sent_by_user_id);

    const chat_users=chat_user.users
    console.log(chat_users)
    const new_message=await message.find({chat_id:chatid}).populate('sender').sort({createdAt:-1}).limit(1);
    // let new_message=await .save().then(data=> {return data.populate('sender').then((data1)=>{return data1})});
    return {new_message:new_message[0],chat_users:chat_users}
}

export default getSingleGroupMessages;