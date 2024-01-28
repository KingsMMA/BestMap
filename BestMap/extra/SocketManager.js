import WebSocket from "../../WebSocket";

export const roomExplored = (room) => {
    if (party === null) return;
    try {
        // socket.send(`{"type": "room_explored", "room": "${room}"}`);
    } catch (e) {
        console.error(e);
    }
}

export const positions = {};

register("command", (...args) => {
    if (!args || !args.length || !args[0]) return ChatLib.chat("&3[BMAP] &bInvalid usage: &9/joinparty <roomCode>");
    if (party !== null) return ChatLib.chat("&3[BMAP] &bYou're already in a party! Run &9/viewparty&b to see your party or &9/leaveparty&b to leave it.");
    party = args[0].replaceAll("\"", "'");
    partyMembers = [];

    try {
        ChatLib.chat("&3[BMAP] &bConnecting to the server...");
        socket = new WebSocket("wss://kingrabbit.dev/bestmap");
        socket.onError = (error) => {
            console.error(`A socket error occurred: ${error}`)
        };
        socket.onOpen = () => {
            ChatLib.chat("&3[BMAP] &bConnected to the server.");
            socket.send(`{"type": "handshake", "ign": "${Player.getName()}", "room": "${party}"}`);
        };
        socket.onMessage = onData;
        socket.onClose = () => {
            ChatLib.chat("&3[BMAP] &bDisconnected from the server.");
            leftParty();
        };
        socket.connect();
    } catch (e) {
        console.log("Error occurred connecting to socket: " + JSON.stringify(e, undefined, 4));
        leftParty();
        return ChatLib.chat("&3[BMAP] &bAn error occurred connecting to the server. Please try again later.");
    }
}).setName("joinparty");

register("command", (...args) => {
    if (party === null) ChatLib.chat("&3[BMAP] &bYou aren't in a party! Use &9/joinparty <roomCode>&b to join/create a party.");
    else ChatLib.chat(`&3[BMAP] &bYour party (&9${party}&b) currently contains the following: &9${partyMembers.join("&b, &9")}`);
}).setName("viewparty");

register("command", (...args) => {
    if (party === null) {
        ChatLib.chat("&3[BMAP] &bYou aren't in a party! Use &9/joinparty <roomCode>&b to join/create a party.");
        return;
    }
    try {
        socket.send('{"type": "leave_party"}');
        socket.close();
    } catch (e) {
        console.error(e);
    }
    leftParty();
    ChatLib.chat("&3[BMAP] &bYou've left the party.");
}).setName("leaveparty");

import DmapDungeon from "../Components/DmapDungeon";

let party = null;
let partyMembers = null;
let socket = null;

function leftParty() {
    party = null;
    partyMembers = null;
    socket = null;
}

function onData(data) {
    // console.log(`Received data from socket: ${data}`);
    data = JSON.parse(data);
    switch (data.type) {
        case "ping":
            socket.send('{"type": "ping"}');
            break;
        case "joined_room":
            partyMembers.push(...data.users);
            if (partyMembers.length === 0) {
                ChatLib.chat("&3[BMAP] &bYou've created a party with invite code &9" + party + "&b. Other players can join by running &9/joinparty " + party + "&b.");
            } else {
                ChatLib.chat("&3[BMAP] &bYou've joined a party with invite code &9" + party + "&b. You'll be playing with: &9" + partyMembers.join("&b, &9") + "&b.");
            }
            break;
        case "user_joined":
            ChatLib.chat(`&3[BMAP] &9${data.ign}&b has joined the party.`);
            break;
        case "user_left":
            ChatLib.chat(`&3[BMAP] &9${data.ign}&b has left the party.`);
            break;
        case "disconnect":
            ChatLib.chat("&3[BMAP] &bYou've been disconnected from the server. Reason: &9" + data.reason);
            leftParty();
            break;
        case "room_explored":
            DmapDungeon.dungeonMap.rooms.forEach(room => {
                if (room.name === data.room) {
                    room.entered = true;
                    // ChatLib.command(`pc Detected ${room.name} has been explored`);
                }
            })
            break;
        case "position":
            positions[data.ign] = {
                x: data.x,
                z: data.z,
                rotation: data.rotation
            };
            break;
        default:
            ChatLib.chat("&3[BMAP] &bReceived unknown message type from server: &9" + data.type);
            break;
    }
}

register("step", () => {
    try {
        if (!socket) return;
        socket.send(`{"type": "position", "x": ${Player.getX()}, "z": ${Player.getZ()}, "rotation": ${Player.getYaw() + 180}}`);
    } catch (e) {}
}).setFps(15);

register("gameUnload", () => {
    if (socket) {
        socket.close();
    }
});
