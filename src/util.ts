import * as api from "./api";
import * as type from "./type";
import * as fs from "fs";

export function readConfig(configJsonPath: string): Promise<type.ConfigrationInterface> {
    return new Promise((resolve, reject) => {
        fs.readFile(configJsonPath, "utf8", (error, data: string) => {
            if (error) {
                if (error.code === "ENOENT") {
                    data = "{}";
                } else {
                    return reject(error);
                }
            }
            resolve(JSON.parse(data));
        })
    })
}

export function getSameWorldFriends(authToken: string, myUserId: string): Promise<type.FriendResult[]> {
    return api.getFriends({
        authToken: authToken,
        offline: false
    }).then((friends: type.FriendResult[]) => {
        const friendArray: type.FriendResult[] = JSON.parse(friends as any);
        const myInfo = Array.from(friendArray).filter((friend) => friend.id === myUserId);
        const myInstanceLocation = myInfo[0].location;
        const sameInstanceFriends = Array.from(friendArray).filter((friend) => friend.location === myInstanceLocation);
        console.log("sameInstanceFriends", sameInstanceFriends);
        return sameInstanceFriends;
    });
}