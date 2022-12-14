/**
 * Possible types we request as refs
 */
export type Ref = "heartbeat_resp" | "open_resp" | "channel_resp" | "follow_resp" | "chat_resp" |
"ban_resp" | "chat_resp" | "delete_resp" | "follow_resp" | "long_timeout_resp" | "short_timeout_resp"|
"unban_resp" | "unfollow_resp" | "update_stream_info_resp" | QueryRef

/**
 * Query refs
 */
type QueryRef = "categories_resp" | "category_resp" | "channelQ_resp" | "channels_resp" | "followers_resp" |
"homepage_channels_resp" | "myself_resp" | "user_resp" | "users_resp"

/**
 * Topic type
 */
export type Topic = "__absinthe__:control" | "phoenix"

/**
 * An event sent from or to the glimesh API.
 */
export type Event = "doc" | "phx_close" | "phx_error" | "phx_join" | "phx_reply" | "phx_leave" |
"heartbeat" | "subscription:data"

/**
 * A response sent from the Glimesh API
 */
export type ApiResponse = [
    /**
     * The join ref. Unique ID sent by you.
     * Returns null for some responses
     */
    string | null,
    /**
     * Ref. Corresponds to a previous reqest.
     * Note that if you subscribe to a graphql subscription and the event occurs, it will not be the ref
     * See subscription ID
     */
    Ref | String | null,
    /**
     * Topic. May contain the subscription ID
     */
    string,
    /**
     * Event
     */
    Event,
    /**
     * Payload
     */
    any
]

/**
 * A request sent to the Glimesh API
 */
export type ApiRequest = [
    /**
     * The join ref. Unique ID sent by you.
     * Should always be the same across all your requests!
     */
    string,
    /**
     * Ref. Will be sent back to you when you when the server receives your request
     */
    Ref | String,
    /**
     * Topic.
     * Use "__absinthe__:control" for opening a connection
     * Use "phoenix" for heartbeats
     */
    Topic,
    /**
     * Event
     * Use "doc" for anything graphql related
     */
    Event,
    /**
     * Payload
     */
    any
]