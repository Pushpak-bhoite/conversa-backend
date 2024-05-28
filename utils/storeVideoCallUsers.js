import message from "../models/messages.model.js";
import chat from "../models/chat.model.js";
import call_history from "../models/call_history.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

async function store_video_joiners(path, Local_U_data) {
    const url = new URL(path);
    console.log('path ---> ', url.pathname);
    const pathName = url.pathname;
    
    setTimeout(async () => {
        try {
            // Find the call history document based on the URL path
            const call_doc = await call_history.findOne({ url_path: pathName });

            // Log the found document
            console.log('call_doc ==>', call_doc);

            if (call_doc) {

                 // Check if the user is the caller
                 if (call_doc.caller_id.equals(Local_U_data._id)) {
                    console.log('User is the caller, not adding to joined_users');
                    return;
                }

                // Check if the user is already in the joined_users array
                const userExists = call_doc.joined_users.some(user => user.equals(Local_U_data._id));

                if (!userExists ) {
                    // Add the user to the joined_users array
                    call_doc.joined_users.push(Local_U_data._id);

                    // Save the updated document
                    let result = await call_doc.save();

                    console.log('User added to joined_users ->result : ', result);
                } else {
                    console.log('User already in joined_users');
                }
            } else {
                console.log('Call history document not found');
            }
        } catch (error) {
            console.error('Error in store_video_joiners:', error);
        }
    }, 3000); // Delay for 3000 milliseconds (3 seconds)
}

export default store_video_joiners;
    