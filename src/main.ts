import * as Constants from "./constants"
import EventEmitter from "eventemitter3"
import { BanParam, ChannelParam, ChatParam,
    CreateChatParam, DeleteChatParam, EventName,
    FollowParam, FollowParamM, Mutation,
    StreamInfoParam, Subscription, TimeoutParam,
    UnFollowParam } from "./customTypes/custom"
import { GlimeshParser } from "./parse"
import { hasValidParam } from "./util/util"
import { ApiRequest } from "./customTypes/protocol"
import { Builder } from "./builder"

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
    private accessToken?: string = "";
    /**
     * Connected to chat using an access token
     */
    private usingToken?: boolean = false
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
    /**
     * Used to build glimesh payloads
     */
    private builder = new Builder(this.joinRef);

    constructor(authInfo: {
        clientId?: string,
        accessToken?: string
    }
    ) {
        super();
        this.clientId = authInfo.clientId;
        this.accessToken = authInfo.accessToken;
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

            // Set acccess token state
            this.usingToken = useToken;
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
     * @param retVal The graphql data to request when the event happens.
     */
    public subToEvent<T extends keyof Subscription>(subType: T, params: Subscription[T], retVal: string = "") {
        switch (subType) {
            case "Channel":
                if (!hasValidParam("channelId", params)) return;

                let channelPayload = this.builder.buildSubscription("channel_resp",
                    `channel(id: ${(<ChannelParam>params)[0].channelId})`,
                    retVal || `stream {countViewers}, title`
                );
                this.connection.send(channelPayload);
                break;

            case "Chat":
                if (!hasValidParam("channelId", params)) return;

                let chatPayload = this.builder.buildSubscription("chat_resp",
                    `chatMessage(channelId: ${(<ChatParam>params)[0].channelId})`,
                    retVal || `id, user { username avatarUrl id }, isSubscriptionMessage, message, ${Constants.MESSAGE_TOKENS}`
                );
                this.connection.send(chatPayload);
                break;

            case "Followers":
                if (!hasValidParam("streamerId", params)) return;

                let followPayload = this.builder.buildSubscription("follow_resp",
                    `followers(streamerId: ${(<FollowParam>params)[0].streamerId})`,
                    retVal || `user { username }`
                );
                this.connection.send(followPayload);
                break;
        }
    }

    public createMutation<T extends keyof Mutation>(mutation: T, params: Mutation[T], retVal: string = "") {
        if (!this.usingToken) return;

        switch (mutation) {
            case "BanUser":
                let banPayload = this.builder.buildMutation("ban_resp",
                    `banUser(channelId:${(<BanParam>params)[0].channelId}, userId:${(<BanParam>params)[1].userId})`,
                    retVal || `updatedAt, user {username}`
                );
                this.connection.send(JSON.stringify(banPayload));
                break;
            case "CreateChatMessage":
                let createChatPayload = this.builder.buildMutation("chat_resp",
                    `createChatMessage(channelId:${(<CreateChatParam>params)[0].channelId}, message: {message: "${(<CreateChatParam>params)[1]}"})`,
                    retVal || `message, id`
                );
                this.connection.send(JSON.stringify(createChatPayload));
                break;
            case "DeleteChatMessage":
                let deleteChatPayload = this.builder.buildMutation("delete_resp",
                    `deleteChatMessage(channelId:${(<DeleteChatParam>params)[0].channelId}, messageId:${(<DeleteChatParam>params)[1].messageId})`,
                    retVal || `action, id`
                );
                this.connection.send(JSON.stringify(deleteChatPayload));
                break;
            case "Follow":
                let followPayload = this.builder.buildMutation("follow_resp",
                    `follow(liveNotifications:${(<FollowParamM>params)[1].enableNotifications}, streamerId:${(<FollowParam>params)[0].streamerId})`,
                    retVal || `id, streamer {username}`
                );
                this.connection.send(JSON.stringify(followPayload));
                break;
            case "LongTimeout":
                let longTimeoutPayload = this.builder.buildMutation("long_timeout_resp",
                    `longTimeoutUser(channelId:${(<TimeoutParam>params)[0].channelId}, userId:${(<TimeoutParam>params)[1].userId})`,
                    retVal || `action, id`
                );
                this.connection.send(JSON.stringify(longTimeoutPayload));
                break;
            case "ShortTimeout":
                let shortTimeoutPayload = this.builder.buildMutation("short_timeout_resp",
                    `shortTimeoutUser(channelId:${(<TimeoutParam>params)[0].channelId}, userId:${(<TimeoutParam>params)[1].userId})`,
                    retVal || `action, id`
                );
                this.connection.send(JSON.stringify(shortTimeoutPayload));
                break;
            case "UnbanUser":
                let unBanPayload = this.builder.buildMutation("unban_resp",
                    `unbanUser(channelId:${(<BanParam>params)[0].channelId}, userId:${(<BanParam>params)[1].userId})`,
                    retVal || `updatedAt, user {username}`
                );
                this.connection.send(JSON.stringify(unBanPayload));
                break;
            case "Unfollow":
                let unFollowPayload = this.builder.buildMutation("unfollow_resp",
                    `unfollow(streamerId: ${(<UnFollowParam>params)[0].streamerId})`,
                    retVal || `id, streamer {username}`
                );
                this.connection.send(JSON.stringify(unFollowPayload));
                break;
            case "UpdateStreamInfo":
                let updateStreamPayload = this.builder.buildMutation("update_stream_info_resp",
                    `updateStreamInfo(channelId: ${(<StreamInfoParam>params)[0].channelId}, title: "${(<StreamInfoParam>params)[1].title}")`,
                    retVal || `id, title`
                );
                this.connection.send(JSON.stringify(updateStreamPayload));
                break;
        }
    }
}