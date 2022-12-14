/**
 * A user of Glimesh, can be a streamer, a viewer or both!
 */
export interface User {
    allowGlimeshNewsletterEmails: boolean
    allowLiveSubscriptionEmails: boolean
    /**
     * URL to the user's avatar
     */
    avatarUrl: string
    /**
     * A user's channel, if they have one
     */
    channel: Channel
    /**
     * Datetime the user confirmed their email address
     */
    confirmedAt: string
    countFollowers: number
    countFollowing: number
    /**
     * Exactly the same as the username, but with casing the user prefers
     */
    displayname: string
    /**
     * Email for the user, hidden behind a scope
     */
    email: string
    followers: Follower[]
    following: Follower[]
    /**
     * Shortcut to a user's followed channels
     */
    followingLiveChannels: Channel[]
    /**
     * Unique User identifier
     */
    id: string
    /**
     * Account creation date
     */
    insertedAt: string
    /**
     * HTML version of the user's profile, should be safe for rendering directly
     */
    profileContentHtml: string
    /**
     * Markdown version of the user's profile
     */
    profileContentMd: string
    /**
     * Qualified URL for the user's Discord server
     */
    socialDiscord: string
    /**
     * Qualified URL for the user's Guilded server
     */
    socialGuilded: string
    /**
     * Qualified URL for the user's Instagram account
     */
    socialInstagram: string
    /**
     * A list of linked social accounts for the user
     */
    socials: UserSocial[]
    /**
     * Qualified URL for the user's YouTube account
     */
    socialYoutube: string
    /**
     * The primary role the user performs on the Glimesh team
     */
    teamRole: string
    /**
     * Account last updated date
     */
    updatedAt: string
    /**
     * Lowercase user identifier
     */
    username: string
    /**
     * YouTube Intro URL for the user's profile
     */
    youtubeIntroUrl: string
}

/**
 * A channel is a user's actual container for live streaming.
 */
export interface Channel {
    /**
     * List of bans in the channel
     */
    bans: ChannelBan[]
    /**
     * Toggle for blocking anyone from posting links
     */
    blockLinks: boolean
    /**
     * Category the current stream is in
     */
    category: Category
    /**
     * Background URL for the Chat Box
     */
    chatBgUrl: string
    /**
     * List of chat messages sent in the channel
     */
    chatMessages: ChatMessage[]
    /**
     * Chat rules in html
     */
    chatRulesHtml: string
    /**
     * Chat rules in markdown
     */
    chatRulesMd: string
    /**
     * Toggle for links automatically being clickable
     */
    disableHyperlinks: boolean
    /**
     * Hash-based Message Authentication Code for the stream
     */
    hmacKey: string
    /**
     * Unique channel identifier
     */
    id: string
    /**
     * Is the stream inaccessible?
     */
    inaccessible: boolean
    /**
     * Channel creation date
     */
    insertedAt: string
    /**
     * The language a user can expect in the stream
     */
    language: string
    /**
     * If the streamer has flagged this channel as only appropriate for Mature Audiences
     */
    matureContent: boolean
    /**
     * Minimum account age length before chatting
     */
    minimumAccountAge: number
    /**
     * List of moderation events in the channel
     */
    moderationLogs: ChannelModerationLog[]
    /**
     * List of moderators in the channel
     */
    moderators: ChannelModerator[]
    /**
     * Channel poster URL
     */
    posterUrl: string
    /**
     * Toggle for requiring confirmed email before chatting
     */
    requireConfirmedEmail: boolean
    /**
     * Toggle for homepage visibility
     */
    showOnHomepage: boolean
    /**
     * Only show recent chat messages?
     */
    showRecentChatMessagesOnly: boolean
    /**
     * The current status of the channnel
     */
    status: ChannelStatus
    /**
     * If the channel is live, this will be the current Stream
     */
    stream: Stream
    /**
     * User associated with the channel
     */
    streamer: User
    /**
     * Current streams unique stream key
     */
    streamKey: string
    streams: Stream[]
    /**
     * Subcategory the current stream is in
     */
    subcategory: Subcategory
    /**
     * Tags associated with the current stream
     */
    tags: Tag[]
    /**
     * The title of the current stream, live or offline.
     */
    title: string
    /**
     * Channel updated date
     */
    updatedAt: string
}

/**
 * A chat message sent to a channel by a user.
 */
export interface ChatMessage {
    /**
     * Channel where the chat message occurs
     */
    channel: Channel
    /**
     * Unique chat message identifier
     */
    id: string
    /**
     * Chat message creation date
     */
    insertedAt: string
    /**
     * Was this message generated by our system for a follow
     * @deprecated See Follow Subscription
     */
    isFollowedMessage: boolean
    /**
     * Was this message generated by our system for a subscription
     * @deprecated No alternative exists yet. Still works for the time being
     */
    isSubscriptionMessage: boolean
    /**
     * The chat message contents, be careful to sanitize because any user input is allowed
     */
    message: string
    /**
     * A collection of metadata attributed to the chat message
     */
    metadata: ChatMessageMetadata
    /**
     * List of chat message tokens used
     */
    tokens: ChatMessageToken[]
    /**
     * Chat message updated date
     */
    updatedAt: string
    /**
     * User who sent the chat message
     */
    user: User
}

/**
 * Metadata attributed to the chat message
 */
export interface ChatMessageMetadata {
    /**
     * Was the user a admin at the time of this message
     */
    admin: boolean
    /**
     * Was the user a moderator at the time of this message
     */
    moderator: boolean
    /**
     * Was the user a platform_founder_subscriber at the time of this message
     */
    platformFounderSubscriber: boolean
    /**
     * Was the user a platform_supporter_subscriber at the time of this message
     */
    platformSupporterSubscriber: boolean
    /**
     * Was the user a streamer at the time of this message
     */
    streamer: boolean
    /**
     * Was the user a subscriber at the time of this message
     */
    subscriber: boolean
}

/**
 * Chat Message Token Interface
 */
export interface ChatMessageToken {
    /**
     * Token text
     */
    text: string
    /**
     * Token type
     */
    type: string
    /**
     * Chat Message Emote Token
     */
    EmoteToken?: EmoteToken
    /**
     * Chat Message Text Token
     */
    TextToken?: TextToken
    /**
     * Chat Message URL Token
     */
    UrlToken?: UrlToken
}

export interface EmoteToken {
    /**
     * Token src URL
     */
    src: string
    /**
     * Token text
     */
    text: string
    /**
     * Token type
     */
    type: string
}

export interface TextToken {
    /**
     * Token text
     */
    text: string
    /**
     * Token type
     */
    type: string
}

export interface UrlToken {
    /**
     * Token text
     */
    text: string
    /**
     * Token type
     */
    type: string
    /**
     * Token URL
     */
    url: string
}

/**
 * A moderation event that happened
 */
export interface ChannelModerationLog {
    /**
     * Action performed
     */
    action: string
    /**
     * Channel the event occurred in
     */
    channel: Channel
    /**
     * Unique moderation event identifier
     */
    id: string
    /**
     * Event creation date
     */
    insertedAt: string
    /**
     * Moderator that performed the event
     */
    moderator: User
    /**
     * Event updated date
     */
    updatedAt: string
    /**
     * Receiving user of the event
     */
    user: User
}

/**
 * A channel moderator
 */
export interface ChannelModerator {
    /**
     * Can ban a user
     */
    canBan: boolean
    /**
     * Can delete a message
     */
    canDelete: boolean
    /**
     * Can perform a long timeout action
     */
    canLongTimeout: boolean
    /**
     * Can perform a short timeout action
     */
    canShortTimeout: boolean
    /**
     * Can unban a user
     */
    canUnban: boolean
    /**
     * Can untimeout a user
     */
    canUnTimeout: boolean
    /**
     * Channel the moderator can moderate in
     */
    channel: Channel
    /**
     * Unique channel moderator identifier
     */
    id: string
    /**
     * Moderator creation date
     */
    insertedAt: string
    /**
     * Moderator updated date
     */
    updatedAt: string
    /**
     * Moderating User
     */
    user: User
}

/**
 * A channel timeout or ban
 */
export interface ChannelBan {
    /**
     * Channel the ban affects
     */
    channel: Channel
    /**
     * When the ban expires
     */
    expiresAt: string
    /**
     * Unique channel ban identifier
     */
    id: string
    /**
     * Channel ban creation date
     */
    insertedAt: string
    /**
     * Reason for channel ban
     */
    reason: string
    /**
     * Channel ban updated date
     */
    updatedAt: string
    /**
     * User the ban affects
     */
    user: User
}

/**
 * The current status of a channel.
 */
export type ChannelStatus = "LIVE" | "OFFLINE"

/**
 * A follower is a user who subscribes to notifications for a particular user's channel.
 */
export interface Follower {
    /**
     * Does this follower have live notifications enabled?
     */
    hasLiveNotifications: boolean
    /**
     * Unique follower identifier
     */
    id: string
    /**
     * Following creation date
     */
    insertedAt: string
    /**
     * The streamer the user is following
     */
    streamer: User
    /**
     * Following updated date
     */
    updatedAt: string
    /**
     * The user that is following the streamer
     */
    user: User
}

/**
 * A linked social account for a Glimesh user.
 */
export interface UserSocial {
    /**
     * Unique social account identifier
     */
    id: string
    /**
     * Platform unique identifier, usually a ID, made into a string
     */
    identifier: string
    /**
     * User socials created date
     */
    insertedAt: string
    /**
     * Platform that is linked, eg: twitter
     */
    platform: string
    /**
     * User socials updated date
     */
    updatedAt: string
    /**
     * Username for the user on the linked platform
     */
    username: string
}

/**
 * A stream is a single live stream in, either current or historical.
 */
export interface Stream {
    /**
     * The category the current stream is in
     */
    category: Category
    /**
     * Channel running with the stream
     */
    channel: Channel
    /**
     * Concurrent viewers during last snapshot
     */
    countViewers: number
    /**
     * Datetime of when the stream was ended, or null if still going
     */
    endedAt: string | null
    /**
     * Unique stream identifier
     */
    id: string
    /**
     * Stream created date
     */
    insertedAt: string
    /**
     * Current stream metadata
     */
    metadata: StreamMetadata[]
    /**
     * Peak concurrent viewers
     */
    peakViewers: null
    /**
     * Datetime of when the stream was started
     */
    startedAt: string
    /**
     * Thumbnail URL of the stream
     */
    thumbnailUrl: string
    /**
     * The title of the channel when the stream was started
     */
    title: string
    /**
     * Stream updated date
     */
    updatedAt: string
}

/**
 * A single instance of stream metadata.
 */
export interface StreamMetadata {
    /**
     * Stream audio codec
     */
    audioCodec: string
    /**
     * Unique stream metadata identifier
     */
    id: string
    /**
     * Ingest Server URL
     */
    ingestServer: string
    /**
     * Viewers on the ingest
     */
    ingestViewers: string
    /**
     * Stream metadata created date
     */
    insertedAt: string
    /**
     * Lost stream input data packets
     */
    lostPackets: number
    /**
     * Negative Acknowledged stream input data packets
     */
    nackPackets: number
    /**
     * Received stream input data packets
     */
    recvPackets: number
    /**
     * Bitrate at the source
     */
    sourceBitrate: number
    /**
     * Ping to the source
     */
    sourcePing: number
    /**
     * Current stream metadata references
     */
    stream: Stream
    /**
     * Current Stream time in seconds
     */
    streamTimeSeconds: number
    /**
     * Stream metadata updated date
     */
    updatedAt: string
    /**
     * Client vendor name
     */
    vendorName: string
    /**
     * Client vendor version
     */
    vendorVersion: string
    /**
     * Stream video codec
     */
    videoCodec: string
    /**
     * Stream video height
     */
    videoHeight: number
    /**
     * Stream video width
     */
    videoWidth: number
}

/**
 * Categories are the containers for live streaming content.
 */
export interface Category {
    /**
     * Unique category identifier
     */
    id: string
    /**
     * Category creation date
     */
    insertedAt: string
    /**
     * Name of the category
     */
    name: string
    /**
     * Slug of the category
     */
    slug: string
    /**
     * Subcategories within the category
     */
    subcategories: Subcategory[]
    /**
     * Tags associated with the category
     */
    tags: Tag[]
    /**
     * Category updated date
     */
    updatedAt: string
}

/**
 * Subcategories are specific games, topics, or genre's that exist under a Category.
 */
export interface Subcategory {
    /**
     * Subcategory background image URL
     */
    backgroundImageUrl: string
    /**
     * Parent category
     */
    category: Category
    /**
     * Unique subcategory identifier
     */
    id: string
    /**
     * Subcategory creation date
     */
    insertedAt: string
    /**
     * Name of the subcategory
     */
    name: string
    /**
     * URL friendly name of the subcategory
     */
    slug: string
    /**
     * Subcategory source
     */
    source: string
    /**
     * Subcategory source ID
     */
    sourceId: string
    /**
     * Subcategory updated date
     */
    updatedAt: string
    /**
     * Was the subcategory created by a user?
     */
    userCreated: boolean
}

/**
 * Tags are user created labels that are either global or category specific.
 */
export interface Tag {
    /**
     * Parent category
     */
    category: Category
    /**
     * The number of streams started with this tag
     */
    countUsage: number
    /**
     * Unique tag identifier
     */
    id: number
    /**
     * Tag creation date
     */
    insertedAt: string
    /**
     * Name of the tag
     */
    name: string
    /**
     * URL friendly name of the tag
     */
    slug: string
    /**
     * Tag updated date
     */
    updatedAt: string
}