/**
 * All possible event types to listen for
 */
export type EventName = "Close" | "Connected" | "Error" | "Heartbeat" |
"Message" | "Open" | EventReady | EventData | MutationData | "Unknown" | "Custom"
/**
 * Glimesh has acknowledged your request and will notify you when the event happens
 */
export type EventReady = "ChatReady" | "ChannelReady" | "FollowReady"
/**
 * Data has returned from an event occuring
 */
export type EventData = "ChatData" | "ChannelData" | "FollowData"

/**
 * Data has returned from a mutation
 */
export type MutationData = "BanData" | "ChatData" | "DeleteData" |
"FollowData" | "LongTimeoutData" | "ShortTimeoutData" | "UnbanData" |
"UnFollowData" | "UpdateStreamInfoData"

/**
 * Which graphQL subscription to target
 */
export type Subscription = "Chat" | "Followers" | "Channel"

/**
 * Which mutation to enact
 */
export interface Mutation {
    BanUser: [ChannelById, UserById],
    CreateChatMessage: [ChannelById, MessageCreate],
    DeleteChatMessage: [ChannelById, MessageById],
    Follow: [StreamerById, LiveNotifications],
    LongTimeout: [ChannelById, UserById],
    ShortTimeout: [ChannelById, UserById],
    UnbanUser: [ChannelById, UserById],
    Unfollow: [StreamerById]
    UpdateStreamInfo: [ChannelById, StreamInfoByTitle]
}

/**
 * Select a user by their ID
 */
export interface UserById  {
    userId: number;
    username?: never
}
/**
 * Select a user by their username
 */
export interface UserByUsername {
    username: number;
    userId?: never
}

/**
 * Select a channel by ID
 */
export interface ChannelById  {
    channelId: number;
    username?: never
}
/**
 * Select a channel by username
 */
export interface ChannelByUsername {
    username: number;
    channelId?: never
}

/**
 * Create a message
 */
export interface MessageCreate {
    message: string
}

/**
 * Select a message by ID
 */
export interface MessageById {
    messageId: number
}

/**
 * Select a streamer by ID (same as user ID)
 */
export interface StreamerById {
    streamerId: number
}

/**
 * Enable live notifications?
 */
export interface LiveNotifications {
    enableNotifications: boolean
}

export interface StreamInfoByTitle {
    title: string
}

/**
 * All of the active subscriptions
 */
export type ActiveSubscriptions = {
    type: Subscription,
    id: string
}

/**
 * Payload that contains an event to emit and the corresponding data
 */
export type EventEmit = {
    type: EventName,
    data: any
}

/**
 * Optional params to be sent to Glimesh.
 */
export type QueryParams = {
    /**
     * Same as a userId
     */
    streamerId?: number
    /**
     * Unique user identifier
     */
    userId?: number
    /**
     * Unique channel identifier
     */
    channelId?: number
}

/**
 * Optional params to be sent to Glimesh.
 */
export type MutationParams = {
    /**
     * Same as a userId
     */
    streamerId?: number
    /**
     * Unique user identifier
     */
    userId?: number
    /**
     * Unique channel identifier
     */
    channelId?: number
    /**
     * The message to send to a chat
     */
    message?: string
    /**
     * Unique message identifier
     */
    messageId?: number
    /**
     * Enable live notifications
     */
    lifeNotifications?: boolean
    /**
     * The title to change
     */
    title?: string
}

/**
 * Params sent to a query/subscription/mutation
 */
export type ParamName = "streamerId" | "userId" | "channelId"