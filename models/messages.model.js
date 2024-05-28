import Mongoose, { Schema } from "mongoose";
import user from "./user.model.js";
import chat from "./chat.model.js"

const message_schema=new Mongoose.Schema({
    chat_id:{
        type:Schema.Types.ObjectId,
        ref:chat
    },
    sender:{
        type:Schema.Types.ObjectId,
        ref:user
    },
    content_type:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true,
    },
    sentAt:{
        type:Date,
        required:true
    },
    receivedAt:{
        type:Date,
    }
},{timestamps:true})

const message=Mongoose.model("message",message_schema);

export default message;