import * as Constants from "./constants"
import EventEmitter from "eventemitter3"
import { EventName, QueryParams, Subscription } from "./customTypes/custom"
import { GlimeshParser } from "./parse"
import { hasValidParam } from "./util/util"
import { ApiRequest } from "./customTypes/protocol"

/**
 * The class that lets you talk with the API
 */
export class GlimeshConnection extends GlimeshParser {
    /**
     * Client ID. Allows for read only access to the API
     */
    private clientId?: string = ""
    /**
     * Access token. Allows for write access to the API
     */
    private accessToken?: string = ""
    /**
     * The websocket connection to Glimesh.
     */
    private connection!: WebSocket;
    /**
     * Custom event emmitter for this library
     */
    private events: EventEmitter<EventName> = new EventEmitter<EventName>();
    /**
     * Heartbeat interval
     */
    private heartbeat: any
    /**
     * Unique ID to join Glimesh as
     */
    private joinRef = "glimeshBrowserAPI"

    constructor(authInfo: {
        clientId?: string,
        accessToken?: string
    }
    ) {
        super();
        this.clientId = authInfo.clientId;
        this.accessToken = authInfo.accessToken
    }

    /**
     * Returns the websocket connection. Allows access to the base websocket events
     * @returns {WebSocket}
     */
    public getConnection(): WebSocket {
        return this.connection;
    }

    /**
     * Connects to Glimesh over a websocket.
     * @param useToken {boolean} Use the access token instead of a client ID
     * @returns {boolean} True if connected, false if not
     */
    public connectToGlimesh(useToken: boolean = false): boolean {
        if (!this.connection) {
            if (useToken) {
                this.connection = new WebSocket(
                    `${Constants.WEBSOCKET_URL}?vsn=2.0.0&token=${this.accessToken}`
                );
            } else {
                this.connection = new WebSocket(
                    `${Constants.WEBSOCKET_URL}?vsn=2.0.0&client_id=${this.clientId}`
                );
            }

            // Add listeners
            this.connection.addEventListener("close", (ev) => this.onClose(ev));
            this.connection.addEventListener("error", (ev) => this.onError());
            this.connection.addEventListener("message", (glimeshMessage) => this.onMessage(glimeshMessage));
            this.connection.addEventListener("open", (ev) => this.onOpen());

            return true
        } else {
            console.log("You are already connected to Glimesh.");
            return false
        }
    }

    /**
     * Runs when the connection is opened.
     * This does not mean that the phoenix channel is open.
     * That process is started when this function runs but will not be completed until the event is emmitted
     */
    private onOpen() {
        console.log("Connected to Glimesh!");
        this.events.emit("Connected", true);

        let open: ApiRequest = [this.joinRef, "open_resp", "__absinthe__:control", "phx_join", {}];
        this.connection.send(JSON.stringify(open));

        let hb: ApiRequest = [this.joinRef, "heartbeat_resp", "phoenix", "heartbeat", {}]
        this.heartbeat = setInterval(() => {
            this.connection.send(JSON.stringify(hb));
        }, 30000);
    }

    /**
     * Runs when data is sent to us over the connection
     * @param message The data from Glimesh
     */
    private onMessage(message: any) {
        console.log(message)
        let eventToEmit = this.parseData(message.data);
        console.log(eventToEmit)
        // TODO check if event is needed to be emmitted
        this.events.emit(eventToEmit.type, eventToEmit.data);
    }

    /**
     * Runs when the connection has an error
     */
    private onError() {
        console.log("Connection closed due to error!");
        this.events.emit("Error");
    }

    /**
     * Runs when the connection is closed
     * @param ev Close event
     */
    private onClose(ev: CloseEvent) {
        console.log("Connection closed");
        this.events.emit("Close", ev.wasClean, ev.code);
        clearInterval(this.heartbeat);
    }

    /**
     * Returns true if the user is connected to Glimesh, false if not
     * @returns {boolean}
     */
    public isConnectedToGlimesh(): boolean {
        return this.connection != null && this.connection.readyState === WebSocket.OPEN
    }

    /**
     * Returns the event emmitter. Allows to listen for custom events
     * @returns {EventEmitter}
     */
    public getEvents(): EventEmitter<EventName> {
        return this.events;
    }

    /**
     * Subscribe to a graphql subscription
     * @param subType The event to subscribe to. Corresponds to a graphql subscription
     * @param params The entity to target. See API to know which params to use.
     */
    public subToEvent(subType: Subscription, params: QueryParams) {
        switch (subType) {
            case "Channel":
                if (!hasValidParam(params, "channelId")) return;
                this.connection.send(`["${this.joinRef}","channel_resp","__absinthe__:control","doc",{"query":"subscription{ channel(id: ${params.channelId}) { stream {countViewers} } }","variables":{} }]`);
                break;

            case "Chat":
                if (!hasValidParam(params, "channelId")) return;
                this.connection.send(`["${this.joinRef}","chat_resp","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: ${params.channelId}) { id, user { username avatarUrl id }, isSubscriptionMessage, message, tokens {...on ChatMessageToken {text} ...on EmoteToken {src} ...on UrlToken {url} ...on TextToken {text}} } }","variables":{} }]`);
                break;

            case "Followers":
                if (!hasValidParam(params, "streamerId")) return;
                this.connection.send(`["${this.joinRef}","follow_resp","__absinthe__:control","doc",{"query":"subscription{ followers(streamerId: ${params.streamerId}) { user { username } } }","variables":{} }]`);
                break;
        }
    }
}


//v__absinthe__:doc:-576460752251016623:7487729DEF2D3335F930AC164CE4C7A4A2D908342E024CFE7813FA9C351DDB8D
//__absinthe__:doc:-576460752251016623:7487729DEF2D3335F930AC164CE4C7A4A2D908342E024CFE7813FA9C351DDB8D
//__absinthe__:doc:-576460752262244622:8981845F702175FBA83BC45D6838B3BE4B1C3C2784936FA7273315A86745F855