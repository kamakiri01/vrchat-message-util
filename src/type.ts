/**
 * configuraiton file
 */
export interface ConfigrationInterface {
    userId?: string;
    authToken?: string;
}


/**
 * auth interface
 */
export interface VerifyInterFace {
    user: string;
    password: string;
}

/**
 * auth result interface
 */
export interface VerifyResultInterface {
    authToken: string;
    myUserId: string;
}

/**
 * base intreface for request which require authentication
 */
export interface AuthenticationRequires {
    /**
     * VRChat API KEY from GET https://api.vrchat.cloud/api/1/config
     * API_KEY
     */
    // apiKey: string;

    /**
     * Token from auth GET https://api.vrchat.cloud/api/1/auth/user?apiKey=
     * authcookie_XXX-XXX-XXX-XXX-XXX
     */
    authToken: string;
}

/**
 * get friends
 */
export interface GetFriendsInterface extends AuthenticationRequires {
    offset?: number;
    n?: number;
    offline?: boolean;
}


/**
 * friend information for get friends
 */
export interface FriendResult {
    id: string;
    username: string;
    displayName: string;
    currentAvatarImageUrl: string;
    currentAvatarThumbnailImageUrl: string;
    tags: string[];
    developerType: string;
    location: string;
}

/**
 * post notification
 * (in correct, send invite)
 */
export interface PostNotificationInterface extends AuthenticationRequires {
    /**
     * VRChat userID.
     * ex: usr_XXX-XXX-XXX-XXX-XXX
     */
    targetUserId: string;

    /**
     * your message
     */
    message: string;
}

/**
 * send friends request
 */
export interface PostFriendRequestInterface extends AuthenticationRequires {
    targetUserId: string;
}
