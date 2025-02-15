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
                throw new Error("ENOENT config.json, generate your token and config file with init command.");
            }
            config = configResult;
        })
        .then(async () => {
            const question: prompts.PromptObject = {
                type: "select",
                name: "target",
                message: "is send target in same world?",
                choices: [
                    {title: "in same world", value: "same"}, {title: "in other world", value: "all"}
                ]
            };
            const result = await prompts(question);
            if (result.target === "same") {
                return util.getSameWorldFriends(config.authToken, config.userId);
            } else {
                return util.getOnlineFriends(config.authToken, config.userId);
            }
        })
        .then(async (friends: type.FriendResult[]) => {
            const question: prompts.PromptObject = {
                type: "select",
                name: "id",
                message: "Who send to?",
                choices: friends.sort((a, b) => {
                    if (a.displayName.toLocaleLowerCase() > b.displayName.toLocaleLowerCase()) {
                        return 1;
                    } else {
                        return -1;
                    }
                }).map(friend => {
                    return {title: friend.displayName, value: friend.id};
                })
            };
            const result = await prompts(question);
            return result.id;
        })
        .then(async (targetUserId: string) => {
            if (!targetUserId) throw new Error("target user id is not provided.");
            const question: prompts.PromptObject = {
                type: "text",
                name: "paragraph",
                message: "What message?"
            };
            const result = await prompts(question);
            if (!result.paragraph) throw new Error("message is not provided.")
            return api.postNotification({
                targetUserId: targetUserId,
                authToken: config.authToken,
                message: result.paragraph
            });
        })
        .then(() => {
            console.log("send completed.")
        })
        .catch((error) => {
            console.log("error: " + error.message);
            process.exit(1);
        })
}

function dump() {
    const configJsonPath: string = path.resolve(__dirname, "..", "config.json");
    let config: type.ConfigrationInterface;
    util.readConfig(configJsonPath)
        .then((configResult: type.ConfigrationInterface) => {
            if (!configResult.userId || !configResult.authToken) {
                throw new Error("ENOENT config.json, generate your token and config file with init command.");
            }
            config = configResult;
        })
        .then(async () => {
            return util.getSameWorldFriends(config.authToken, config.userId);

        })
        .then(async (friends: type.FriendResult[]) => {
            console.log(friends.map(friend => {
                return {
                    id: friend.id,
                    username: friend.username,
                    displayName: friend.displayName
                };
            }));
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

function noCommand() {
    Promise.resolve()
        .then(async () => {

            const question: prompts.PromptObject = {
                type: "select",
                name: "target",
                message: "select command:",
                choices: Object.keys(commands).map(commandName => {
                    return {title: commandName, value: commandName};
                })
            };
            const result = await prompts(question);
            commands[result.target]();
        })
}

const commands: {[key: string]: () => void} = {
    init,
    send,
    dump,
    help
};

export function run(argv: string[]) {
    const commandName = argv[2];
    if (!!commands[commandName]) {
        commands[commandName]();
    } else {
        noCommand();
    }
}
