import Mongoose, { Schema } from 'mongoose';
import chat from './chat.model.js';
import user from './user.model.js';

const call_history_schema = new Mongoose.Schema({
    chat_id: {
        type: Schema.Types.ObjectId,
        ref: chat,
        required: true
    },
    // ------Added fields --------
    caller_id: {
        type: Schema.Types.ObjectId,
    },
    url_path :{
        type: String,
        required: true,
    },
    members : [{
        type: Schema.Types.ObjectId,
        ref: user
    }],
    // --------------------------------
    joined_users: [{
        type: Schema.Types.ObjectId,
        ref: user
    }],
    call_type: {
        type: String,
        enum: ["Audio", "Video"],
        required: true
    },
    startAt: {
        type: Date,
        required: true
    },
    endAt: {
        type: Date
    }
}, { timestamps: true })

const call_history = Mongoose.model("call_history", call_history_schema);

export default call_history;