import * as r from "request";
import * as type from "./type";

const API_KEY = "JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26";

/**
 * @param param
 * @returns authToken
 */
export function verify(param: type.VerifyInterFace): Promise<type.VerifyResultInterface> {
    const authUrl = "https://api.vrchat.cloud/api/1/auth/user?apiKey=" + API_KEY;

    return new Promise((resolve, reject) => {
        r.get(authUrl, {
            auth: {
                user: param.user,
                password: param.password
              },
            }, (error, response, body) => {
                if (error) return reject(error);
                try {
                    const body = JSON.parse(response.body)
                    const myUserId = body.id;
                    const cookies = response.headers["set-cookie"];
                    const authTokenStr = cookies.find((cookie) => cookie.indexOf("auth=authcookie") === 0);
                    const authToken = authTokenStr.match(/^auth=(.+);/)[1];
                    return resolve({
                        authToken: authToken,
                        myUserId: myUserId
                    });
                } catch (err) {
                    return reject(err);
                }
        })
    });
}

export function getFriends(param: type.GetFriendsInterface): Promise<type.FriendResult[]> {
    const url = "https://api.vrchat.cloud/api/1/auth/user/friends?apiKey=" + API_KEY + "&" + "authToken=" + param.authToken;
    return new Promise((resolve, reject) => {
        r.get(url, {}, (error, response, body) => {
            if (error) return reject(error);
            resolve(body);
        });
    });
}

export function postNotification(param: type.PostNotificationInterface): Promise<void> {
    const postUrl = "https://api.vrchat.cloud/api/1/user/" + param.targetUserId + "/notification";
    var option = {
        url: postUrl,
        method: "POST",
        form: {
            message: "", // no need ?
            type: "invite",
            apiKey: API_KEY,
            authToken: param.authToken,
            details: JSON.stringify({ worldId: "", worldName: param.message })
        }
    }
    return new Promise((resolve, reject) => {
        r.post(option, function(error, response, body){
            if (error) return reject(error);
            resolve(body);
        });
    });
}

export function postFriendRequest(param: type.PostFriendRequestInterface) {
    const postUrl = "https://api.vrchat.cloud/api/1/user/" + param.targetUserId + "/friendRequest";
    var option = {
        url: postUrl,
        method: "POST",
        form: {
            apiKey: API_KEY,
            authToken: param.authToken
        }
    }

    return new Promise((resolve, reject) => {
        r.post(option, function(error, response, body){
            if (error) return reject(error);
            resolve(body);
        });
    });
}
