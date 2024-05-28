import express from 'express';
import user from '../models/user.model.js';
import formidable from 'formidable';
import passport from 'passport';
import bcrypt from 'bcrypt';
import generateTokenAndSetCookie from './generateToken.js';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import chat from '../models/chat.model.js';
import mongoose from 'mongoose';
import message from '../models/messages.model.js';

const saveImages = express.Router();


const base_url=path.join(dirname(fileURLToPath(import.meta.url)),"../")




saveImages.post("/saveImages", async (req, res) => {
    var form = formidable({
        allowEmptyFiles: true, // Allow empty files
        minFileSize:0,
    })
    let fields;
    let files;
    let filename;
    try {
        [fields, files] = await form.parse(req);
        
    } catch (err) {
        console.log(err)
    }
    console.log(fields)
    // console.log(files)



    
    if(files){
        for(let i=0;i<files['data[]'].length;i++){
            const cur_date = new Date();
    let ids = [];
    ids.push(new mongoose.Types.ObjectId(fields['ids[sent_by_user_id]'][0]))
    ids.push(new mongoose.Types.ObjectId(fields['ids[sent_to_user_id]'][0]))

    let chat_user;
    if(fields['isGroupChat'][0]!==""){
        chat_user = await chat.findOne({ _id: new mongoose.Types.ObjectId(fields['ids[sent_to_user_id]'][0]) });// Finding Chat 
    }
    else{
        chat_user = await chat.findOne({ users: { $all: ids } });// Finding Chat 

    }
    console.log(' chat_user======> ',chat_user);
    let chatid;

    if (!chat_user) {
        const create_chat = new chat({
            users: ids
        })

        chat_user = await create_chat.save();
        chat_user = await chat.findOne({ users: { $all: ids } }).populate("users");

        chatid = chat_user._id;
    }

    chatid = chat_user._id;

    const old_path=files['data[]'][i].filepath
        filename=files['data[]'][i].originalFilename
        const folder_path=base_url+"uploads/"+chatid
        if (!fs.existsSync(folder_path)) {
            fs.mkdirSync(folder_path,{ recursive: true });
        }
        const file_path=base_url+"uploads/"+chatid+"/"+filename
        fs.copyFile(old_path,file_path,function(err){
            if(err) throw err
        })

    const insert_message = new message({
        chat_id: chatid,
        sender: fields['ids[sent_by_user_id]'][0],
        content_type: "file",
        message: filename,
        sentAt: cur_date
    });

    let new_message = await insert_message.save().then((data) => { return data.populate('sender').then((data1) => { return data1 }) });
}
}

res.status(200).json({"changed_value":"value changed"})

})

export default saveImages;