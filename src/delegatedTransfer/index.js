import EventEmmitter from "events";

const IPFS = Symbol("ipfs");
const TOPIC = Symbol("topic");
const NAMESPACE = Symbol("namespace");
const ID = Symbol("ID");
const REPEATING = Symbol("REPEATING");
const storeMsg = Symbol("storeMsg");
const getTopicPath = Symbol("getTopicPath");
const receiveMessage = Symbol("receiveMessage");
const verifyMessage = Symbol("verifyMessage");
const notifyChange = Symbol("notifyChange");
const checkDone = Symbol("checkDone");

export const MESSAGE_STATUS = {
    WAITING: "waiting",
    DONE: "done"
};

export default class TransferProcessor extends EventEmmitter {
    repeatInterval = 5000;

    constructor(ipfs, namespace = "delegator") {
        super();
        this[IPFS] = ipfs;
        this[TOPIC] = false;
        this[NAMESPACE] = namespace;
        this[ID] = null;
        this[REPEATING] = false;
    }

    get repeating() {
        return this[REPEATING];
    }

    get id() {
        if (!this[ID]) {
            const ipfs = this[IPFS];
            this[ID] = ipfs.id().then(res => res.id);
        }
        return this[ID];
    }

    async readAllFiles(dir, fileList) {
        const ipfs = this[IPFS];
        const result = [];
        for (let file of fileList) {
            const fileContent = await ipfs.files.read(`${dir}/${file.name}`);
            result.push(JSON.parse(fileContent.toString()));
        }
        return result;
    }

    async exportTopic(topic) {
        const result = {
            [MESSAGE_STATUS.WAITING]: [],
            [MESSAGE_STATUS.DONE]: []
        };

        if (!topic && !this[TOPIC]) {
            console.debug("missing topic!");
            return result;
        }

        if (!topic && this[TOPIC]) {
            topic = this[TOPIC];
        }

        const ipfs = this[IPFS];
        const topicPath = `${this[getTopicPath](topic)}`;
        const waitingDir = `${topicPath}/${MESSAGE_STATUS.WAITING}`;
        const doneDir = `${topicPath}/${MESSAGE_STATUS.DONE}`;
        const hasWaiting = await this.hasPath(waitingDir);
        const hasDone = await this.hasPath(doneDir);
        if (hasWaiting) {
            const waitingFiles = await ipfs.files.ls(waitingDir);
            result[MESSAGE_STATUS.WAITING] = await this.readAllFiles(waitingDir, waitingFiles);
        }
        if (hasDone) {
            const doneFiles = await ipfs.files.ls(doneDir);
            result[MESSAGE_STATUS.DONE] = await this.readAllFiles(doneDir, doneFiles);
        }

        return result;
    }

    async hasPath(path) {
        const ipfs = this[IPFS];
        try {
            const result = await ipfs.files.stat(path);
            return result;
        } catch (e) {
            return false;
        }
    }

    async repeat() {
        const topic = this[TOPIC];
        if (topic && !this[REPEATING]) {
            const topicPath = `${this[getTopicPath](topic)}`;
            const dir = `${topicPath}/${MESSAGE_STATUS.WAITING}`;
            const hasPath = await this.hasPath(dir);
            if (hasPath) {
                this[REPEATING] = true;
                let changed = false;
                console.debug("[delegator] repeat start", topicPath);
                const ipfs = this[IPFS];
                const files = await ipfs.files.ls(dir);
                for (let file of files) {
                    if (file.type === 0) {
                        const msg = await ipfs.files.read(`${dir}/${file.name}`);
                        const isDone = await this[checkDone](msg);
                        if (!isDone) {
                            await ipfs.pubsub.publish(topic, msg);
                        } else {
                            await ipfs.files.mv(
                                `${topicPath}/${MESSAGE_STATUS.WAITING}/${file.name}`,
                                `${topicPath}/${MESSAGE_STATUS.DONE}/${file.name}`,
                                { parents: true, flush: true }
                            );
                            changed = true;
                        }
                    }
                }
                console.log("[delegator] repeat end");
                this[REPEATING] = false;
                if (changed) {
                    this[notifyChange](topic);
                }
            } else {
                console.debug("missing directory:", dir);
            }
        }
        setTimeout(() => this.repeat(), this.repeatInterval);
    }

    listen(topic) {
        const ipfs = this[IPFS];
        const oldTopic = this[TOPIC];
        if (oldTopic !== topic && oldTopic) {
            ipfs.pubsub.unsubscribe(oldTopic);
        }
        ipfs.pubsub.subscribe(
            topic,
            msg => this[receiveMessage](msg),
            err => {
                if (err) {
                    return console.error(`failed to subscribe to ${topic}`, err);
                }
                console.debug(`subscribed to ${topic}`);
            }
        );
        this[TOPIC] = topic;
        this[notifyChange]();
    }

    publish(msg) {
        return this[storeMsg](msg, "me", this[TOPIC]);
    }

    verify(msg) {
        return Promise.resolve(msg);
    }

    isDone(msg) {
        return Promise.resolve(false);
    }

    [checkDone](msg) {
        const msgObj = JSON.parse(msg.toString());
        return this.isDone(msgObj);
    }

    [getTopicPath](topic) {
        return `/${this[NAMESPACE]}/${topic}`;
    }

    [storeMsg](msg, from, topic) {
        const ipfs = this[IPFS];
        return this[verifyMessage](msg)
            .then(() => {
                if (!topic) {
                    return Promise.reject("missing topic!");
                }
                const filename = msg.hash.toLowerCase();
                const topicPath = this[getTopicPath](topic);
                return { topicPath, filename };
            })
            .then(({ topicPath, filename }) => {
                const dirPath = `${topicPath}/${MESSAGE_STATUS.DONE}`;
                const msgPath = `${dirPath}/${filename}`;
                return this.hasPath(msgPath).then(exists =>
                    exists ? Promise.reject("already in done") : { topicPath, filename }
                );
            })
            .then(({ topicPath, filename }) => {
                const dirPath = `${topicPath}/${MESSAGE_STATUS.WAITING}`;
                const msgPath = `${dirPath}/${filename}`;
                msg.lastSeen = {
                    from,
                    date: Date.now()
                };
                return ipfs.files
                    .write(msgPath, Buffer.from(JSON.stringify(msg)), { create: true, parents: true })
                    .then(() => filename);
            })
            .then(() => {
                this[notifyChange](topic);
            });
    }

    [receiveMessage](rawMessage) {
        const msg = JSON.parse(rawMessage.data.toString());
        return this.id.then(id => {
            if (rawMessage.from !== id) {
                return this[storeMsg](msg, rawMessage.from, rawMessage.topicIDs[0]);
            } else {
                return Promise.resolve("");
            }
        });
    }

    [verifyMessage](msg) {
        if (!msg.hash) {
            return Promise.reject("missing message hash");
        }
        return this.verify(msg);
    }

    [notifyChange]() {
        this.emit("change");
    }
}
