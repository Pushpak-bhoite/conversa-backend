import message from "../models/messages.model.js";
import chat from "../models/chat.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";


async function getMessages(details){

    //const ids=Object.values(details).map(id=>new mongoose.Types.ObjectId(id))
    // const chat_data=await chat.findOne({users:{$all:ids}})

    const chat_data=await chat.findOne({_id:details.chat_id})
    if(chat_data){
        const messages=await message.find({chat_id:chat_data.id}).populate('sender')
        return {messages:messages,chat_id:chat_data._id};
    }
    else
    {
        return null;
    }    
}

export default getMessages;