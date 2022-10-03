/**
 * All possible event types to listen for
 */
export type EventName = "Close" | "Connected" | "Error" | "Heartbeat" |
"Message" | "Open" | EventReady | EventData | "Unknown" | "Custom"
/**
 * Glimesh has acknowledged your request and will notify you when the event happens
 */
export type EventReady = "ChatReady" | "ChannelReady" | "FollowReady"
/**
 * Data has returned from an event occuring
 */
export type EventData = "ChatData" | "ChannelData" | "FollowData"

/**
 * Which graphQL subscription to target
 */
export type Subscription = "Chat" | "Followers" | "Channel"

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
 * Params sent to a query/subscription/mutation
 */
export type ParamName = "streamerId" | "userId" | "channelId"