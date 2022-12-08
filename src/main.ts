import * as Constants from "./constants"
import EventEmitter from "eventemitter3"
import { BanParam, CategoryParam, ChannelParam, ChatParam,
    CreateChatParam, DeleteChatParam, EventName,
    FollowParam, FollowParamM, Mutation,
    Query,
    StreamInfoParam, Subscription, TimeoutParam,
    UnFollowParam } from "./customTypes/custom"
import { GlimeshParser } from "./parse"
import { combineParams, hasValidParam, hasValidParams, pickParam } from "./util/util"
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
        console.log(message);
        let eventToEmit = this.parseData(message.data);
        console.log(eventToEmit);
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
                //if (!hasValidParam("channelId", params)) return;

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

    public createMutation<T extends keyof Mutation>(mutation: T, params: Mutation[T], retVal: string = ""): Promise<any> {
        if (!this.usingToken) return new Promise((resolve, reject) => reject("Client-id not valid for a mutation"));

        let mutationResult = new Promise((resolve, reject) => {
            //if we don't get it in 7 seconds an error was probably returned
            let tim = setTimeout(() => {
                reject("Timeout or Error");
            }, 7000);
            
            //Setup the listener
            this.events.once("InternalMutation" as EventName, (data) => {
                clearTimeout(tim)
                resolve(data);
            });
        })

        switch (mutation) {
            case "BanUser":
                if (!hasValidParams(["channelId", "userId"], params, [0, 1])) return new Promise((resolve, reject) => reject("Missing Param"));

                let banPayload = this.builder.buildMutation("ban_resp",
                    `banUser(channelId:${(<BanParam>params)[0].channelId}, userId:${(<BanParam>params)[1].userId})`,
                    retVal || `updatedAt, user {username}`
                );
                this.connection.send(banPayload);
            break;
            case "CreateChatMessage":
                if (!hasValidParams(["channelId", "message"], params, [0, 1])) return new Promise((resolve, reject) => reject("Missing Param"));

                let createChatPayload = this.builder.buildMutation("chat_resp",
                    `createChatMessage(channelId:${(<CreateChatParam>params)[0].channelId}, message: {message: "${(<CreateChatParam>params)[1].message}"})`,
                    retVal || `message, id`
                );
                this.connection.send(createChatPayload);
            break;
            case "DeleteChatMessage":
                if (!hasValidParams(["channelId", "messageId"], params, [0, 1])) return new Promise((resolve, reject) => reject("Missing Param"));

                let deleteChatPayload = this.builder.buildMutation("delete_resp",
                    `deleteChatMessage(channelId:${(<DeleteChatParam>params)[0].channelId}, messageId:${(<DeleteChatParam>params)[1].messageId})`,
                    retVal || `action, id`
                );
                this.connection.send(deleteChatPayload);
            break;
            case "Follow":
                if (!hasValidParams(["streamerId", "enableNotifications"], params, [0, 1])) return new Promise((resolve, reject) => reject("Missing Param"));

                let followPayload = this.builder.buildMutation("follow_resp",
                    `follow(liveNotifications:${(<FollowParamM>params)[1].enableNotifications}, streamerId:${(<FollowParam>params)[0].streamerId})`,
                    retVal || `id, streamer {username}`
                );
                this.connection.send(followPayload);
            break;
            case "LongTimeout":
                if (!hasValidParams(["channelId", "userId"], params, [0, 1])) return new Promise((resolve, reject) => reject("Missing Param"));

                let longTimeoutPayload = this.builder.buildMutation("long_timeout_resp",
                    `longTimeoutUser(channelId:${(<TimeoutParam>params)[0].channelId}, userId:${(<TimeoutParam>params)[1].userId})`,
                    retVal || `action, id`
                );
                this.connection.send(longTimeoutPayload);
            break;
            case "ShortTimeout":
                if (!hasValidParams(["channelId", "userId"], params, [0, 1])) return new Promise((resolve, reject) => reject("Missing Param"));
                let shortTimeoutPayload = this.builder.buildMutation("short_timeout_resp",
                    `shortTimeoutUser(channelId:${(<TimeoutParam>params)[0].channelId}, userId:${(<TimeoutParam>params)[1].userId})`,
                    retVal || `action, id`
                );
                this.connection.send(shortTimeoutPayload);
            break;
            case "UnbanUser":
                if (!hasValidParams(["channelId", "userId"], params, [0, 1])) return new Promise((resolve, reject) => reject("Missing Param"));

                let unBanPayload = this.builder.buildMutation("unban_resp",
                    `unbanUser(channelId:${(<BanParam>params)[0].channelId}, userId:${(<BanParam>params)[1].userId})`,
                    retVal || `updatedAt, user {username}`
                );
                this.connection.send(unBanPayload);
            break;
            case "Unfollow":
                if (!hasValidParams(["streamerId"], params, [0])) return new Promise((resolve, reject) => reject("Missing Param"));

                let unFollowPayload = this.builder.buildMutation("unfollow_resp",
                    `unfollow(streamerId: ${(<UnFollowParam>params)[0].streamerId})`,
                    retVal || `id, streamer {username}`
                );
                this.connection.send(unFollowPayload);
            break;
            case "UpdateStreamInfo":
                if (!hasValidParams(["channelId", "title"], params, [0, 1])) return new Promise((resolve, reject) => reject("Missing Param"));

                let updateStreamPayload = this.builder.buildMutation("update_stream_info_resp",
                    `updateStreamInfo(channelId: ${(<StreamInfoParam>params)[0].channelId}, title: "${(<StreamInfoParam>params)[1].title}")`,
                    retVal || `id, title`
                );
                this.connection.send(updateStreamPayload);
            break;
        }

        return mutationResult;
    }

    public createQuery<T extends keyof Query>(query: T, params: Query[T], retVal: string = ""): Promise<any> {
        if (query == "Myself" && !this.usingToken) {
            console.warn("You attempted to query the myself object without using a token.");
            return new Promise((resolve, reject) => reject("Cannot query myself with client-id"));
        }

        let queryResult = new Promise((resolve, reject) => {
            //if we don't get it in 7 seconds an error was probably returned
            let tim = setTimeout(() => {
                reject("Timeout or Error");
            }, 7000);

            //Setup the listener
            this.events.once("InternalQuery" as EventName, (data) => {
                clearTimeout(tim)
                resolve(data);
            });
        })


        switch (query) {
            case "Categories":
                let categoriesPayload = this.builder.buildQuery("categories_resp",
                    `categories`, retVal || `id, name, slug`
                );
                this.connection.send(categoriesPayload);
            break;
            case "Category":
                let categoryPayload = this.builder.buildQuery("category_resp",
                    `category(slug: "${(<CategoryParam>params)[0].name}")`, retVal || "id, name, slug"
                );
                this.connection.send(categoryPayload);
            break;
            case "Channel":
                let channelParamSet = pickParam(["id", "streamerUsername", "streamerId"], params,);
                if (channelParamSet == null) return new Promise((resolve, reject) => reject("Missing Param"));

                let channelPayload = this.builder.buildQuery("channelQ_resp",
                    `channel(${channelParamSet.param}: ${channelParamSet.val})`,
                    retVal || "id, title"
                );
                this.connection.send(channelPayload)
            break;
            case "Channels":
                let channelsParamSet = combineParams(["categorySlug", "status"], params);
                channelsParamSet += combineParams(["first", "last"], params);
                channelsParamSet += combineParams(["after", "before"], params);
                
                let channelsQuery: string
                if (channelsParamSet == "") {
                    channelsQuery = this.builder.buildQuery("channels_resp", 
                        `channel`, retVal || "edges {node {id, status}}"
                    );
                } else {
                    channelsQuery = this.builder.buildQuery("channels_resp",
                        `channels(${channelsParamSet})`, retVal || "edges {node {id, status}}"
                    )
                }
                this.connection.send(channelsQuery);
            break;
            case "Followers":
                let followParamSet = pickParam(["userId", "streamerId"], params);
                if (followParamSet == null) return new Promise((resolve, reject) => reject("Missing Param"));
                let followPayload: string;

                let followPaginationAmount = pickParam(["first", "last"], params, 1);
                if (followPaginationAmount == null) {
                    followPayload = this.builder.buildQuery("followers_resp",
                        `followers(${followParamSet.param}: ${followParamSet.val})`, 
                        retVal || "edges {node {user {username}, streamer {username}}}"
                    );
                } else {
                    let followPaginationArea = pickParam(["before", "after"], params, 2);
                    if (followPaginationArea == null) {
                        followPayload = this.builder.buildQuery("followers_resp",
                            `followers(${followParamSet.param}: ${followParamSet.val}, ${followPaginationAmount.param}: ${followPaginationAmount.val})`, 
                            retVal || "edges {node {user {username}, streamer {username}}}"
                        );
                    } else {
                        followPayload = this.builder.buildQuery("followers_resp",
                        `followers(${followParamSet.param}: ${followParamSet.val}, ${followPaginationAmount.param}: ${followPaginationAmount.val}, ${followPaginationArea.param}, ${followPaginationArea.val})`, 
                        retVal || "edges {node {user {username}, streamer {username}}}"
                    );
                    }
                }
                this.connection.send(followPayload);
            break;
            case "HomepageChannels":
                let homePagePayload = this.builder.buildQuery("homepage_channels_resp",
                    `homepageChannels`, retVal || "edges {node {id, title, matureContent, streamer {username}}}"
                );
                this.connection.send(homePagePayload);
            break;
            case "Myself":
                let myselfPayload = this.builder.buildQuery("myself_resp",
                    `myself`, retVal || "id, username"
                );    
                this.connection.send(myselfPayload);
            break;
            case "User":
                let userParamSet = pickParam(["id", "username"], params,);
                if (userParamSet == null) return new Promise((resolve, reject) => reject("Missing Param"));

                let userPayload = this.builder.buildQuery("user_resp",
                    `user(${userParamSet.param}: ${userParamSet.val})`, retVal || "id, username"
                );
                this.connection.send(userPayload);
            break;
            case "Users":
                let usersParamSet = combineParams(["first", "last"], params);
                usersParamSet += combineParams(["after", "before"], params);
                
                let usersQuery: string
                if (usersParamSet == "") {
                    usersQuery = this.builder.buildQuery("users_resp", 
                        `users`, retVal || "edges {node {id, username}}"
                    );
                } else {
                    usersQuery = this.builder.buildQuery("users_resp",
                        `users(${usersParamSet})`, retVal || "edges {node {id, username}}"
                    )
                }
                this.connection.send(usersQuery);
            break;
        }

        return queryResult;
    }
}