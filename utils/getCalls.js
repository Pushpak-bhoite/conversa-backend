import call_history from "../models/call_history.model.js";
import chat from "../models/chat.model.js";
import user from "../models/user.model.js";

async function getAllCalls(details) {
    try {
        // Find call history documents where the members array contains the provided ID
        const calls = await call_history.find({ members: details }).populate("members").populate("caller_id");

        if (calls.length === 0) {
            return null;
        }

        const results = [];

        for (const call of calls) {
            const chatDoc = await chat.findById(call.chat_id).populate("users");

            if (!chatDoc) {
                continue; // Skip this call if associated chat document is not found
            }

            const { group_name, users } = chatDoc;
            const { caller_id, members, joined_users, startAt , call_type } = call;

            let name = '';
            let responseType = '';
            let responseValue = '';

            const nonMatchingUser = users.find(u => u._id.toString() !== details);
            if (nonMatchingUser) {
                const userDoc = await user.findById(nonMatchingUser._id);
                if (userDoc) {
                    name = userDoc.name;
                }
            }

            const date = new Date(startAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            if (group_name === "") {
                if (details === caller_id.toString()) {
                    if (members.length === joined_users.length + 1 ) {
                        responseType = "Outgoing call";
                        responseValue = "Accepted";
                    } else {
                        responseType = "Outgoing call";
                        responseValue = "Rejected";
                    }
                } else {
                    if (members.length === joined_users.length + 1) {
                        responseType = "Incoming call";
                        responseValue = "Accepted";
                    } else {
                        responseType = "Incoming call";
                        responseValue = "Rejected";
                    }
                }
            } else {
                if (details === caller_id.toString()) {
                    responseType = "Video call";
                    responseValue = "Accepted";
                } else if (joined_users.some(userId => userId.toString() === details)) {
                    responseType = "Group video call";
                    responseValue = "Accepted";
                } else {
                    responseType = "Group video call";
                    responseValue = "Rejected";
                }

                const callerDoc = await user.findById(caller_id);
                if (callerDoc) {
                    name = callerDoc.name;
                }
            }

            results.push({ type: responseType, value: responseValue, name, group_name, date , domain: call_type });
        }

        return results;
    } catch (error) {
        console.error('Error fetching call history:', error);
        throw error; // Optionally handle the error as needed
    }
}

export default getAllCalls;
