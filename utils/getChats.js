import chat from "../models/chat.model.js";

async function getChats(details){

const chat_data=await chat.find({users: { $elemMatch: { $eq: details } }}).populate("users");
if(chat_data.length!==0){
    return chat_data;
}
else{
    return null;
}

}

export default getChats;