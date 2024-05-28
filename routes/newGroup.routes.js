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

const NewGroup = express.Router();


const base_url=path.join(dirname(fileURLToPath(import.meta.url)),"../")


NewGroup.post('/login', async (req, res) => {
        try {
            const is_user = await user.findOne({ email: req.body.email });
            generateTokenAndSetCookie(is_user,res)
           
        } catch (error) {
            res.json({'Error in auth.routes.js ':error});
        }
    });

    NewGroup.get('/login', (req, res) => {
    res.status(400).send({ error: "Something went wrong !!!" });
})

NewGroup.get('/log-out', (req, res) => {
    try {
        res.cookie('jwt','',{maxAge: 0})
        res.status(200).json({message: '*******Youre logged out *******'})
    } catch (error) {
        console.log('error in auth.roiutes.js==>',error)
        res.status(500).json({"error in auth.roiutes.js==>" :error});
    }
})


NewGroup.post("/create", async (req, res) => {
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
    console.log(files)


     const ids=fields['users[]'].map(id=>new mongoose.Types.ObjectId(id))
     console.log(ids)
    let new_group_chat=new chat({
        group_name:fields.group_name[0],
        chat_type:"Group",
        users:ids,
        message_permission:fields.message_permission[0],
    })
    const created_chat=await new_group_chat.save()
    
    if(files){
        const old_path=files.group_image[0].filepath
        filename=files.group_image[0].originalFilename
        const folder_path=base_url+"uploads/"+created_chat._id
        if (!fs.existsSync(folder_path)) {
            fs.mkdirSync(folder_path,{ recursive: true });
        }
        const file_path=base_url+"uploads/"+created_chat._id+"/"+filename
        fs.copyFile(old_path,file_path,function(err){
            if(err) throw err
        })

        await chat.findByIdAndUpdate(created_chat._id,{chat_img:filename})
        .then((result1)=>{
            res.status(200).json({"new_chat":result1})
        })
        .catch((err) => res.send(err.message));
    }
    else{

    }
    

})

export default NewGroup;