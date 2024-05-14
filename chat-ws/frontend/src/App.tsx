// import './App.css'
// import {useEffect, useRef, useState} from "react";
// import {ChatMessage, IncomingLastMessage, IncomingNewMessage, Pictures} from "./types";
// import {IncomingMessages} from "./types";
//
// function App(this: any) {
//     const [messages, setMessage] = useState<ChatMessage[]>([]);
//     const [messageText, setMessageText] = useState("");
//     const [username, setUsername] = useState("");
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const ws = useRef<WebSocket | null>(null);
//     const [pictures, setPictures] = useState<Pictures[]>([]);
//
//     const canvasMethod = () => {
//         let canvas = this.canvas.current;
//         let ctx = canvas.getContext('2d');
//
//         this.state.pictures.forEach(item => {
//             ctx.beginPath();
//             ctx.arc(item.x, item.y, 10, 0, 2 * Math.PI);
//             ctx.fillStyle = item.color;
//             ctx.fill();
//             ctx.stroke();
//         })
//     };
//
//
//
//     const changeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setUsername(e.target.value);
//     };
//     const changeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setMessageText(e.target.value);
//     };
//
//     const sendUsername = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!ws.current) return;
//         ws.current.send(JSON.stringify({
//             type: 'SET_USERNAME',
//             payload: username
//         }));
//         setIsLoggedIn(true);
//     };
//
//     const sendMessage = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!ws.current) return;
//         ws.current.send(JSON.stringify({
//             type: 'SEND_MESSAGE',
//             payload: messageText
//         }));
//     };
//
//     useEffect(() => {
//         ws.current = new WebSocket("ws://localhost:8000/chat");
//         ws.current.addEventListener('close', () => {
//             console.log("Connection closed");
//         });
//         ws.current.addEventListener('message', (msg) => {
//             const decodedMsg:IncomingNewMessage | IncomingLastMessage = JSON.parse(msg.data) as IncomingMessages;
//             if (decodedMsg.type === 'NEW_PICTURE') {
//                 // console.log(decodedMsg.payload);
//                 this.setState({pictures:[...this.state.pictures, {x: this.x, y: this.y, color: this.color}]});
//                 this.canvasMethod();
//             }
//
//             if (decodedMsg.type === 'LAST_PICTURES') {
//                 // setMessage(prev => [...prev, decodedMsg.payload]);
//                 this.setState({pictures: pictures});
//                 this.canvasMethod();
//             }
//         })
//
//         return () => {
//             if (ws.current){
//                 ws.current.close();
//             }
//         }
//     }, []);
//
//     let chat = (
//         <div>
//             {messages.map((message, idx) => (
//                 <div key={idx}>
//                     <b>{message.username}: </b>
//                     {message.text}
//                 </div>
//             ))}
//             <form onSubmit={sendMessage}>
//                 <input
//                     type="text"
//                     name="messageText"
//                     value={messageText}
//                     onChange={changeMessage}
//                 />
//                 <input type="submit" value="Send" />
//             </form>
//         </div>
//     );
//
//     if (!isLoggedIn) {
//         chat = (
//             <form onSubmit={sendUsername}>
//                 <input
//                     type="text"
//                     name="username"
//                     value={username}
//                     onChange={changeUsername}
//                 />
//                 <input type="submit" value="Enter Chat" />
//             </form>
//         );
//     }
//     return (
//         <div className="App">
//             {chat}
//         </div>
//     );
// }
//
// export default App

import {Component, createRef} from 'react';
import './App.css'
import * as React from "react";
class App extends Component {
    state = {
        color: '',
        pictures: [],
    };

    canvasMethod = () => {
        let canvas = this.canvas.current;
        let ctx = canvas.getContext('2d');

        this.state.pictures.forEach(item => {
            ctx.beginPath();
            ctx.arc(item.x, item.y, 10, 0, 2 * Math.PI);
            // @ts-ignore
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.stroke();
        })
    };
    public websocket: any;
    componentDidMount() {
        this.websocket = new WebSocket('ws://localhost:8000/chat');
        this.websocket.onmessage = (message) => {
            try {
                const data = JSON.parse(message.data);
                switch (data.type) {
                    case 'NEW_PICTURE':
                        this.setState({pictures:[...this.state.pictures, {x: data.x, y: data.y, color: data.color}]});
                        this.canvasMethod();
                        break;
                    case 'LAST_PICTURES':
                        this.setState({pictures: data.pictures});
                        this.canvasMethod();
                        break;
                    default:
                        console.log('No type ' + data.type)
                }
            }catch (e) {
                console.error('Something went wrong', e)
            }

        };
    }
    colorChanger = (e:React.ChangeEvent<HTMLInputElement>) => this.setState({color: e.target.value});
    submitColor = (e:React.FormEvent) => {
        e.preventDefault();
        if (isNaN(this.state.color)) {

            const color = {
                type: 'COLOR_CHANGER',
                color: this.state.color
            };
            this.websocket.send(JSON.stringify(color));
        } else if(this.state.color === ''){
            alert('Вы ничего не ввели')
        } else {
            alert('Вы ввели число')
        }

    };
    canvas = createRef();
    onCanvasClick = e => {

        e.persist();

        const canvas = this.canvas.current;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const x = e.clientX - rect.left - 5;
        const y = e.clientY - rect.top - 5;

        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = this.state.color;
        ctx.fill();
        ctx.stroke();

        const message = {
            type: 'CREATE_PICTURE',
            x: x,
            y: y,
        };
        this.websocket.send(JSON.stringify(message));
    };
    render() {
        return (

            <div>
                <form onSubmit={this.submitColor}>
                    <div className='block'>
                        <label htmlFor="field">Цвет</label>
                        <input type="text" onChange={this.colorChanger} className='field' id='field'/>
                        <button type='submit'>Change</button>
                    </div>
                </form>
                <canvas
                    width='1000'
                    height='800'
                    ref={this.canvas}
                    onClick={this.onCanvasClick}
                    style={{border: '2px solid black', margin: '2% 0 0 15%', borderRadius: '5px'}}/>
            </div>
        );
    }
}

export default App;