import { ActiveSubscriptions, EventEmit } from "./customTypes/custom";
import { ApiResponse } from "./customTypes/protocol";


export class GlimeshParser {

    private subscriptions: ActiveSubscriptions[] = []

    constructor() { }

    /**
     * Handle data from the GLimesh API.
     * Determines what the data is and what to do with it.
     * Returns an event to emit or none if it can be ignored.
     * @param data The raw data from the API (not parsed)
     */
    public parseData(data: string): EventEmit {
        let parsedData: ApiResponse = JSON.parse(data);
        console.log(parsedData);

        // Checks for errors, if found stops execution and returns the problem
        if (this.checkErrors(parsedData[4])) return {data: parsedData[4].response.errors, type: "Error"}

        // Determine the ref and respond acordingly
        switch (parsedData[1]) {
            case "open_resp":
                return {type: "Open", data: null}
            case "heartbeat_resp":
                return {type: "Heartbeat", data: null}
            case "channel_resp":
                this.subscriptions.push({type: "Channel", id: parsedData[4].response.subscriptionId})
                return {type: "ChannelReady", data: null}
            case "chat_resp":
                this.subscriptions.push({type: "Chat", id: parsedData[4].response.subscriptionId})
                return {type: "ChatReady", data: null}
            case "follow_resp":
                this.subscriptions.push({type: "Followers", id: parsedData[4].response.subscriptionId})
                return {type: "FollowReady", data: parsedData[4].response.data}
            case "ban_resp":
                return {type: "BanData", data: parsedData[4].response.data}
            case "delete_resp":
                return {type: "DeleteData", data: parsedData[4].response.data}
            case "long_timeout_resp":
                return {type: "LongTimeoutData", data: parsedData[4].response.data}
            case "short_timeout_resp":
                return {type: "ShortTimeoutData", data: parsedData[4].response.data}
            case "unban_resp":
                return {type: "UnbanData", data: parsedData[4].response.data}
            case "unfollow_resp":
                return {type: "UnFollowData", data: parsedData[4].response.data}
            case "update_stream_info_resp":
                return {type: "UpdateStreamInfoData", data: parsedData[4].response.data}
            default: return this.handleData(parsedData)
        }
    }

    private checkErrors(data: any) {
        if (data.response && data.response.errors != undefined && data.response.errors.length > 0) {
            console.error(data);
            return true
        }
        return false
    }

    /**
     * Handle when a subscribed event occurs.
     * Returns the event to emit and the data relating to it
     * @param data API response
     */
    private handleData(data: ApiResponse): EventEmit {
        // Make sure its data from an event
        if (data[3] !== "subscription:data") {
            //Likely a mutation or query
            if (this.checkMutation(data)) {
                return {type: "InternalMutation" as EventEmit["data"], data: data[4]}
            }
            if (this.checkQuery(data)) {
                return {type: "InternalQuery" as EventEmit["data"], data: data[4]}
            }

            // We don't know what this is.
            return {type: "Unknown", data: data[4]}
        }

        // Check if the topic is in our subscribed IDs
        // If it is we determine the type and send the related data
        for (const subscription of this.subscriptions) {
            if (data[2].includes(subscription.id)) {
                switch(subscription.type) {
                    case "Channel": return {type: "ChannelData", data: data[4].result.data}
                    case "Chat": return {type: "ChatData", data: data[4].result.data}
                    case "Followers": return {type: "FollowData", data: data[4].result.data}
                }
            }
        }

        // If an unhandled event occurs we return the data related
        return {type: "Unknown", data: data[4]}
    }

    /**
     * Returns all of the active subscriptions
     */
    public getActiveSubscriptions(): ActiveSubscriptions[] {
        return this.subscriptions;
    }

    /**
     * Checks if the response is a mutation
     */
    private checkMutation(data: ApiResponse) {
        switch (data[1]) {
            case "ban_resp":
            case "chat_resp":
            case "delete_resp":
            case "follow_resp":
            case "long_timeout_resp":
            case "short_timeout_resp":
            case "unban_resp":
            case "unfollow_resp":
            case "update_stream_info_resp":
                return true
            default: return false
        }
    }

    /**
     * Checks if the response is a query
     */
    private checkQuery(data: ApiResponse): boolean {
        switch (data[1]) {
            case "categories_resp":
            case "category_resp":
            case "channelQ_resp":
            case "channels_resp":
            case "followers_resp":
            case "homepage_channels_resp":
            case "myself_resp":
            case "user_resp":
            case "users_resp":
                return true
            default: return false
        }
    }
}