import * as prompts from "prompts";
import * as api from "./api";
import * as util from "./util";
import * as type from "./type";
import * as fs from "fs";
import * as path from "path";

/**
 * generate auth token and write config.json
 */
function init() {
    const configJsonPath: string = path.resolve(__dirname, "..", "config.json");
    let config: type.ConfigrationInterface;
    return new Promise((resolve, reject) => {
        console.log("(re)generate auth token...");
        util.readConfig(configJsonPath)
        .then(async (configResult) => {
            config = configResult;
            const question: prompts.PromptObject[] = [
                {
                  type: "text",
                  name: "username",
                  message: "username"
                },
                {
                  type: "password",
                  name: "password",
                  message: "password"
                }
              ];
            const userInfo = await prompts(question);
            return api.verify({
                user: userInfo.username,
                password: userInfo.password
            })
        })
        .then((result: type.VerifyResultInterface) => {
            config.userId = result.myUserId;
            config.authToken = result.authToken;

            fs.writeFile(configJsonPath, JSON.stringify(config, null, "\t"), {encoding: "utf8"}, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            console.log("authorization has succeeded.")
        })
        .then(() => {
            util.friendRequest(config.authToken, config.userId);
            console.log("sent friend request to you from yourself. accept it in vrchat web or app.");
        })
        .then(() => {
            console.log([
                "",
                "init completed.",
                "generated config.json in current directory.",
                "don't publish this file. it has secret information. take care."
            ].join("\n"));
        })
    });
}

/**
 * send message
 */
function send() {
    const configJsonPath: string = path.resolve(__dirname, "..", "config.json");
    let config: type.ConfigrationInterface;
    util.readConfig(configJsonPath)
        .then((configResult: type.ConfigrationInterface) => {
            if (!configResult.userId || !configResult.authToken) {
                console.log("ENOENT config.json, generate your token and config file with init command.");
                return process.exit(1);
            }
            config = configResult;
        })
        .then(() => {
            return util.getSameWorldFriends(config.authToken, config.userId);
        })
        .then(async (sameInstanceFriends: type.FriendResult[]) => {
            const question: prompts.PromptObject = {
                type: "select",
                name: "id",
                message: "Who send to?",
                choices: sameInstanceFriends.map(friend => {
                    return {title: friend.displayName, value: friend.id};
                })
            };
            const result = await prompts(question);
            return result.id;
        })
        .then(async (targetUserId: string) => {
            const question: prompts.PromptObject = {
                type: "text",
                name: "paragraph",
                message: "What message?"
            };
            const result = await prompts(question);

            return api.postNotification({
                targetUserId: targetUserId,
                authToken: config.authToken,
                message: result.paragraph
            });
        })
        .then(() => {
            console.log("send completed.")
        })
}

function help() {
    console.log([
        "command:",
        "  init: authentication and generate config file",
        "  send: message to your friend in same world",
        "  help: you look now"
    ].join("\n"));
}

export function run(argv: string[]) {
    switch(argv[2]) {
    case "init":
        init();
        break;
    case "send":
        send();
        break;
    case "help":
    default:
        help();
    }
}

run(process.argv);