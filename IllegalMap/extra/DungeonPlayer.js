import Config from "../data/Config"
import Lookup from "../utils/Lookup"
import {
    chunkLoaded,
    getMojangInfo,
    getSbProfiles,
    dataObject,
    getMostRecentProfile
} from "../utils/Utils"

const DefaultIcon = new Image("defaultMapIcon.png", "https://i.imgur.com/GKHfOCt.png")
const DeadPlayer = new Image("deadPlayer.png", "https://i.imgur.com/LWFEReQ.png")

export class DungeonPlayer {
    constructor(player) {
        this.player = player
        this.uuid = null
        this.inRender = false // Is within render distance of the player

        this.icon = null
        this.iconX = 0
        this.iconY = 0
        this.yaw = 0

        this.size = [8, 8]
        
        this.isDead = false
        this.head = null
        this.hasSpirit = false

        this.currentRoom = null

        this.initialize()
    }
    initialize() {
        // Get player head, check for spirit pet and get UUID
        getMojangInfo(this.player).then(mojangInfo => {
            mojangInfo = JSON.parse(mojangInfo)
            this.uuid = mojangInfo.id
            this.head = new Image(javax.imageio.ImageIO.read(new java.net.URL(`https://crafatar.com/avatars/${this.uuid}`)))
            if (dataObject.apiKey) {
                getSbProfiles(this.uuid, dataObject.apiKey).then(sbProfiles => {
                    sbProfiles = JSON.parse(sbProfiles)
                    let profile = getMostRecentProfile(this.uuid, sbProfiles)
                    let pets = profile["members"][this.uuid]["pets"]
                    for (let i = 0; i < pets.length; i++) {
                        if (pets[i].type == "SPIRIT" && pets[i].tier == "LEGENDARY") {
                            this.hasSpirit = true
                        }
                    }
                }).catch(error => {
                    // ChatLib.chat(error)
                })
            }
            // getSbProfiles(uuid, )
        })
    }
    render() {
        let head = this.head
        if (!head) { head = DefaultIcon }
        if (this.isDead) {
            head = DeadPlayer
            yaw = 0
        }
        let yaw = this.isDead ? 0 : this.yaw
        
        this.size = this.head ? [Config.mapScale * (Config.headScale * 4), Config.mapScale * (Config.headScale * 4)] : [7, 10]
        let size = this.isDead ? [Config.mapScale * (Config.headScale * 3), Config.mapScale * (Config.headScale * 3)] : this.size

        // Renderer.scale(0.1 * Config.mapScale, 0.1 * Config.mapScale)
        Renderer.translate(Config.mapX + this.iconX, Config.mapY + this.iconY)
        // Renderer.drawRect(Renderer.color(255, 0, 0, 255), this.iconX, this.iconY, 5, 5)
        Renderer.translate(size[0] / 2, size[1] / 2)
        Renderer.rotate(yaw)
        Renderer.translate(-size[0] / 2, -size[1] / 2)
        Renderer.drawImage(head, 0, 0, size[0], size[1])
        // Renderer.retainTransforms(false)
    }
    renderName() {
        Renderer.translate(Config.mapX + this.iconX, Config.mapY + this.iconY)
        Renderer.scale(0.1 * Config.mapScale, 0.1 * Config.mapScale)
        Renderer.drawStringWithShadow(this.player, (-Renderer.getStringWidth(this.player) + this.size[0]*2)/2, + this.size[1]*2)
    }
    toJson() {
        return {
            "player": this.player,
            "uuid": this.uuid,
            "icon": this.icon,
            "isDead": this.isDead,
            "headIcon?": !this.head ? false : true,
            "spirit": this.hasSpirit,
            "x": this.iconX,
            "z": this.iconY
        }
    }
    getCurrentRoom(dungeon) {
        let room = Lookup.getRoomFromCoords([this.iconX, this.iconY], dungeon)
        if (!room) { return }
        return room
    }
    print() {
        ChatLib.chat(JSON.stringify(this.toJson(), "", 4))
    }
}