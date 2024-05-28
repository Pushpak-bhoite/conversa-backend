import user from "../models/user.model.js";

async function getUser(searchVal){
    const searchUser=await user.find(
            {$or:[
                {"name":{$regex:searchVal,$options:"i"}},
                {"email":{$regex:searchVal,$options:"i"}},
                {"phone_no":{$regex:searchVal,$options:"i"}}
            ]},
            {
                _id:1,name:1,
                email:1,
                phone_no:1,
                profile_img:1
            });
    return searchUser;
}

export default getUser;