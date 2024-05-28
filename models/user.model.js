import Mongoose, { Schema } from 'mongoose';

let user;
const user_schema=new Mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    phone_no:{
        type:String,
        required:true,
        unique:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    gender:{
        type:String,
        required:true,
        enum:["male","female","other"],
        default:"others"
    },
    dob:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        required:true,
        enum:["online","offline"],
        default:"offline"
    },
    profile_img:{
        type:String,
        default:""
    },
    deletedAt:{
        type:Date,
    },
    country:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        enum:["personal","business"],
        default:"personal"
    },
    blocked_by:[{
        type:Schema.Types.ObjectId,
        ref:user
    }],
    resetToken: {
        type: String,
        default: null,
    },
},{timestamps:true})

user=Mongoose.model("user",user_schema);

export default user;