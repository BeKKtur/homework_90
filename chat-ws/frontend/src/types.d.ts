export interface ChatMessage {
    username: string;
    text: string;
}
export interface Pictures {
    color: string;
    picture: [];
    x: string;
    y: string;
}

export interface IncomingNewMessage {
    type: 'NEW_PICTURE';
    payload: Pictures;
}

export interface IncomingLastMessage {
    type: 'LAST_PICTURES';
    payload: Pictures;
}


export type IncomingMessages = IncomingNewMessage | IncomingLastMessage;