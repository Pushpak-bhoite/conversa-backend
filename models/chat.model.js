import Mongoose, { Schema }  from "mongoose";
import user from "./user.model.js";

const chat_schema=new Mongoose.Schema({
    group_name:{
        type:String,
        default:""
    },
    chat_type:{
        type:String,
        enum:["Personal","Group","Channel"],
        default:"Personal"
    },
    deletedAt:{
        type:Date,
    },
    users:[{
        type:Schema.Types.ObjectId,
        ref:user,
    }],
    message_permission:{
        type:String,
        enum:["All","Admin"],
        default:"All"
    },
    chat_img:{
        type:String,
        default:""
    }
},{timestamps:true})

const chat=Mongoose.model("chat",chat_schema);

export default chat;