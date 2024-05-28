import message from "../models/messages.model.js";
import chat from "../models/chat.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";


async function getSingleMessages(details){

    //const ids=Object.values(details).map(id=>new mongoose.Types.ObjectId(id))
    // const chat_data=await chat.findOne({users:{$all:ids}})
    const ids = Object.values(details.ids).map(id => new mongoose.Types.ObjectId(id)) 
    let chat_user = await chat.findOne({ users: { $all: ids } });

    if(chat_user){
        const messages=await message.find({chat_id:chat_user.id}).populate('sender').sort({createdAt:-1}).limit(1);
        // return {messages:messages,chat_id:chat_data._id};
        console.log(messages)
        return { new_message: messages[0] }

    }
    else
    {
        return null;
    }    
}

export default getSingleMessages;