import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import getUser from '../utils/searchUser.js';
import { send } from 'process';
import send_message from '../utils/sendMessage.js';
import getMessages from '../utils/getMessages.js';
import GetChats from '../utils/getChats.js';
import setseenmessage from '../utils/setSeen.js'
import send_message_group from '../utils/sendGroupMessage.js';
import getSingleMessages from '../utils/getSingleMessage.js';
import getSingleGroupMessages from '../utils/getSingleGroupMessage.js';
import video_call from '../utils/videoCall.js';
import audio_call from '../utils/audioCall.js';
import group_video from '../utils/groupVideo.js';
import group_audio from '../utils/groupAudio.js';
import store_video_joiners from '../utils/storeVideoCallUsers.js';
import getAllCalls from '../utils/getCalls.js';


const app = express();
// ---------------------------------
let connections = {}
let messages = {}
let timeOnline = {}
let videoHistoryMap = {}
// ---------------------------------
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    }
});

const userSocketMap = {};

io.on('connection', (socket) => {
    console.log("A user is connecte with socket id:" + socket.id);
    const UserID = socket.handshake.query.UserID;
    if (UserID !== "undefined") userSocketMap[UserID] = socket.id;
    socket.on("greetings", data => {
        console.log("greeting sreceived:", data)
    })
    socket.on("search_val", data => { sendSearchUser(data) })
    socket.emit("return_greet", "Hello there!!!")
    io.emit("online_users", Object.keys(userSocketMap))
    socket.on("send_message", (data) => {
        console.log('send_message -> data', data);
        sendmsg(data, 0);
    })
    socket.on("send_image", (data) => {
        sendmsg(data, 1);
    })
    socket.on("send_image_group", (data) => {
        send_group_message(data, 1);
    })
    socket.on('get_messages_user', data => {
        // console.log('get_messages_user -> data', data);
        getmsg(data);
    })
    socket.on("get_chats", data => {
        getchats(data);
    })
    socket.on("set_seen_message", data => {
        setchatseen(data);
    })
    socket.on("get_new_group_chat", data => {
        get_new_group_chat(data);
    })
    socket.on("send_group_message", data => {
        send_group_message(data, 0);
    })
    // ------------------ Video Calling --------------------------------
    socket.on("join-call", (path, Local_U_data) => {
        // console.log('connections[path]-->',connections[path])
        if (connections[path] === undefined) {
            connections[path] = []
        }
        // -------------------------- Custom -------------------------------------------------------
        store_video_joiners(path, Local_U_data)
        // Initialize videoHistoryMap[video_url] as an empty array if it doesn't exist
        if (!videoHistoryMap[path]) {
            videoHistoryMap[path] = [];
        }
        // Push Local_U_data into videoHistoryMap[video_url]
        videoHistoryMap[path].push(Local_U_data);


        // -------------------------------------------------------------------------- 


        connections[path].push(socket.id)
        timeOnline[socket.id] = new Date();
        // connections[path].forEach(elem => {
        //     io.to(elem)
        // })
        for (let a = 0; a < connections[path].length; a++) {
            io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
        }
        if (messages[path] !== undefined) {
            for (let a = 0; a < messages[path].length; ++a) {
                io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                    messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
            }
        }
    })
    socket.on("signal", (toId, message) => {
        io.to(toId).emit("signal", socket.id, message);
    })
    socket.on("make_video_request", (details) => {
        const socketId = userSocketMap[details.ids.sent_to_user_id];
        io.to(socketId).emit("video_request_from_server", details.video_url, details.Local_U_data);
        make_video(details);
    })
    socket.on("make_group_video", async (details) => {
        const senderSocketId = userSocketMap[details.Local_U_data._id];
        
        console.log(details.ids.sent_to_user_id);
        const data = await group_video(details);
        data.chat_users.forEach((socketId) => {
            if (userSocketMap[socketId]) {
                if(senderSocketId === userSocketMap[socketId]){
                    return;
                }
                console.log('All ids',userSocketMap[socketId] )
                io.to(userSocketMap[socketId]).emit("video_request_from_server", details.video_url, details.Local_U_data);

            }
        })

    })

      // *************************************************************************

      socket.on("make_audio_request", (details) => {
        const socketId = userSocketMap[details.ids.sent_to_user_id];
        io.to(socketId).emit("video_request_from_server", details.video_url, details.Local_U_data);
        make_audio(details);
    })
    
    socket.on("make_group_audio", async (details) => {
        const senderSocketId = userSocketMap[details.Local_U_data._id];
        
        // console.log(details.ids.sent_to_user_id);
        const data = await group_audio(details);
        data.chat_users.forEach((socketId) => {
            if (userSocketMap[socketId]) {
                if(senderSocketId === userSocketMap[socketId]){
                    return;
                }
                // console.log('All ids',userSocketMap[socketId] )
                io.to(userSocketMap[socketId]).emit("video_request_from_server", details.video_url, details.Local_U_data);
            }
        })
    })
    
    // *************************************************************************

    socket.on("cut_video_request", (toId) => {
        const socketId = userSocketMap[toId];
        io.to(socketId).emit("cut_video_from_server", socketId);
    })

    socket.on("get_call_history", data => {
        getCallsHistory(data);
    })

    //   -------------------- Disconnect --------------------
    socket.on("disconnect", () => {
        delete userSocketMap[UserID];
        console.log("User Disconnected");
        io.emit("online_users", Object.keys(userSocketMap))
        // ------------------ Disconnect Video Calling --------------------------------
        var diffTime = Math.abs(timeOnline[socket.id] - new Date())
        var key
        for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
            for (let a = 0; a < v.length; ++a) {
                if (v[a] === socket.id) {
                    key = k
                    for (let a = 0; a < connections[key].length; ++a) {
                        io.to(connections[key][a]).emit('user-left', socket.id)
                    }
                    var index = connections[key].indexOf(socket.id)
                    connections[key].splice(index, 1)
                    if (connections[key].length === 0) {
                        delete connections[key]
                    }
                }
            }
        }
    })
})
async function sendSearchUser(data) {
    const user = await getUser(data[0]);
    const id = data[1]
    io.to(userSocketMap[id]).emit("search_user", user);
}
async function sendmsg(data, isFile) {
    if (isFile === 0) {
        const new_message = await send_message(data);
        const ids = Object.values(data.ids)
        io.to(userSocketMap[ids[0]]).to(userSocketMap[ids[1]]).emit("send_save_message", new_message)
    }
    else {
        const new_message = await getSingleMessages(data);
        const ids = Object.values(data.ids)
        io.to(userSocketMap[ids[0]]).to(userSocketMap[ids[1]]).emit("send_save_message", new_message)
    }
}
async function getmsg(data) {
    const messages = await getMessages(data);
    const id = data.login_user;
    io.to(userSocketMap[id]).emit("receive_messsages", messages);
}

async function getchats(data) {
    const chats = await GetChats(data);
    // console.log('chats -->)', chats)
    io.to(userSocketMap[data]).emit("get_user_chats", chats)

}
async function setchatseen(data) {
    const msg = await setseenmessage(data);
    console.log(msg);
}
async function get_new_group_chat(data) {
    data.users.forEach((user) => {
        if (userSocketMap[user]) {
            io.to(userSocketMap[user]).emit("get_new_group_chat", data)
        }
    })
}
async function send_group_message(data, isFile) {
    if (isFile === 0) {
        const msg = await send_message_group(data);
        const new_data = { new_message: msg.new_message }
        msg.chat_users.forEach((item) => {
            if (userSocketMap[item]) {
                io.to(userSocketMap[item]).emit("send_save_message", new_data)
            }
        })
    }
    else {
        const msg = await getSingleGroupMessages(data);
        const new_data = { new_message: msg.new_message }
        msg.chat_users.forEach((item) => {
            if (userSocketMap[item]) {
                io.to(userSocketMap[item]).emit("send_save_message", new_data)
            }
        })
    }
}
// ----------------------Video call --------------------
async function make_video(details) {
    video_call(details);
}

async function make_audio(details) {
    audio_call(details);
}


async function getCallsHistory(data) {
    const calls = await getAllCalls(data);
    // console.log(calls)
    io.to(userSocketMap[data]).emit("get_Calls_history", calls)

}


export { app, io, server }