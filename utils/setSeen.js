import mongoose from "mongoose";
import message from "../models/messages.model.js";
import chat from "../models/chat.model.js";

async function setseenmessage(data){
    const cur_date=new Date();
    const msg=await message.updateMany({chat_id:new mongoose.Types.ObjectId(data.chat_id),sender:new mongoose.Types.ObjectId(data.other_user)},{$set:{receivedAt:cur_date}});
    return msg;
}

export default setseenmessage;