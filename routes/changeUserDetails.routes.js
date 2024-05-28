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

const changeUserDetails = express.Router();


const base_url=path.join(dirname(fileURLToPath(import.meta.url)),"../")




changeUserDetails.post("/user_profile", async (req, res) => {
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
    // console.log(fields)
    // console.log(files)



    
    if(files){
        const old_path=files.change_picture[0].filepath
        filename=files.change_picture[0].originalFilename
        const folder_path=base_url+"uploads/"+fields.user_id[0]
        if (!fs.existsSync(folder_path)) {
            fs.mkdirSync(folder_path,{ recursive: true });
        }
        const file_path=base_url+"uploads/"+fields.user_id[0]+"/"+filename
        fs.copyFile(old_path,file_path,function(err){
            if(err) throw err
        })
        // const changed_record=await user.findByIdAndUpdate(fields.user_id[0],{profile_img:filename})

        await user.findByIdAndUpdate(fields.user_id[0],{profile_img:filename},{new:true})
        .then((result1)=>{
            res.status(200).json({"changed_value":result1})
        })
        .catch((err) => res.send(err.message));
    }


})

export default changeUserDetails;