import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import {ActiveConnections, IncomingMessage} from "./types";

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();

const activeConnections:ActiveConnections = {}


router.ws('/chat', (ws, req) => {
    const id = crypto.randomUUID();
    console.log('client connected! id = ', id);
    activeConnections[id] = ws;
    const pictures = [];
    let color:string;
    let username = 'anonymous'

    ws.send(JSON.stringify({type: 'WELCOME', payload: 'Hello, you have connected to the chat'}));

    ws.on('message', (msg) => {
        console.log(`Incoming message from ${id} , ${msg}`);

        // @ts-ignore
        const parsed = JSON.parse(msg);
        switch (parsed.type) {
            case 'CREATE_PICTURE':
                Object.keys(activeConnections).forEach(connId => {
                    const connection = activeConnections[connId];
                    const newMessage = {x: parsed.x, y: parsed.y, color};
                    connection.send(JSON.stringify({
                        type: 'NEW_PICTURE',
                        ...newMessage
                    }));
                    pictures.push(newMessage);
                });
                break;
            case 'COLOR_CHANGER':
                color = parsed.color;
                break;
            default:
                console.log('No type' + parsed.type)
        }
    });

    // ws.on('message', (message) => {
    //     console.log(message.toString());
    //     const parsedMessage = JSON.parse(message.toString()) as IncomingMessage;
    //     if (parsedMessage.type === 'SET_USERNAME' ){
    //         username = parsedMessage.payload
    //     } else if (parsedMessage.type === 'SEND_MESSAGE' ){
    //         Object.values(activeConnections).forEach(connection => {
    //             const outgoingMessage = {type: 'NEW_MESSAGE', payload: {username, text: parsedMessage.payload}};
    //             connection.send(JSON.stringify(outgoingMessage));
    //         })
    //     }
    // })

    ws.on('close', () => {
        console.log('client disconnected id = ', id);
        delete activeConnections[id];
    })
});

app.use(router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})