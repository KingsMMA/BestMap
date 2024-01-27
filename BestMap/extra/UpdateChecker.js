import Config from "../data/Config"
import request from "../../requestV2"
import { prefix } from "../utils"

let checked = false
register("step", () => {
    if (checked || !Config.notifyUpdates) return
    checked = true
    request("https://raw.githubusercontent.com/KingsMMA/BestMap/main/BestMapAPI.json").then(stuff => {
        stuff = JSON.parse(stuff.replace(new RegExp("    ", "g"), ""))
        // ChatLib.chat(JSON.stringify(stuff, "", 4))
        let metadata = JSON.parse(FileLib.read("BestMap", "metadata.json"))

        if (metadata.version == stuff.latestVersion) return
        
        new Message(`&9&m${ChatLib.getChatBreak(" ")}\n`,
        new TextComponent(`${prefix} &aA new version of BestMap is available! (&c${stuff.latestVersion}&a) Click to go to the Github page! `).setClick(
            "open_url",
            "https://github.com/KingsMMA/BestMap"
        ).setHover(
            "show_text",
            "&aClick to open\n&7https://github.com/KingsMMA/BestMap"
        ),
        new TextComponent(`&7(Changelog)`).setHover(
            "show_text",
            `&6&nChangeLog for ${stuff.latestVersion}:\n &7- ` + stuff.changelog.join("\n &7- ")
        ),
        `\n&9&m${ChatLib.getChatBreak(" ")}`).chat()
    }).catch(error => {
        ChatLib.chat(`${prefix} &cError whilst checking for update: ${error}`)
    })
})