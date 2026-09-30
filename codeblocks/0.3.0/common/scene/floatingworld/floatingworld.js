export default {
    scope: undefined,
    world: undefined,
    commandDelay: 500,
    commandTimer: undefined,
    playerCount: 0,
    objects: {},
    setupDOM: function (canvasElement, outputElement, scope) {
        canvasElement.html('')
        this.scope = scope
        this.resetFloatingWorld(canvasElement)
    },
    init: function (canvasElement, outputElement, scope, runner) {
        this.scope = scope
        this.resetFloatingWorld(canvasElement)

        // this.runCommand([{ "command": "show" }, { "command": "new", "object": { "type": "Player", "playerType": 0, "id": 1 } }, { "command": "addPlayer", "object": { "type": "Player", "id": 1 } }, { "command": "new", "object": { "type": "Player", "playerType": 1, "id": 2 } }, { "command": "addPlayer", "object": { "type": "Player", "id": 2 } }, { command: "movePlayer", "object": { "type": "Player", "id": 1 }, value: -90 }, { command: "movePlayer", "object": { "type": "Player", "id": 1 }, value: -90 }, { command: "removePlayer", "object": { "type": "Player", "id": 1 } }], 0)
    },
    addArgumentsTo(args) {
    },
    reset(canvasElement) {
        this.resetFloatingWorld(canvasElement)
    },
    update: function (txt, json, canvasElement, outputElement) {
        this.resetFloatingWorld(canvasElement)
        this.runCommand(json, 0)
    },
    //custom functions
    resetFloatingWorld: function (canvasElement) {
        if (this.commandTimer !== undefined) {
            clearTimeout(this.commandTimer)
            this.commandTimer = undefined
        }
        this.objects = {}
        this.playerCount = 0;

        const floatingWorld = $(document.createElement('div'))
        floatingWorld.attr('id', 'floatingworld')

        canvasElement.html('')
        canvasElement.append(floatingWorld)
        canvasElement.css('border', 'none')

        this.world = floatingWorld
    },
    runCommand(commands, idx) {
        //get css var called --cb-fw-width
        this.commandTimer = undefined
        if (idx < 0 || idx >= commands.length) return
        const cmd = commands[idx]
        const cmdName = cmd.command
        let hasDelay = true

        const self = this;
        function moveObject(obj, x, y, absolute = true) {
            //console.log("moveObject", obj.type, obj.id, obj.linkedWith)
            const dx = absolute ? x - obj.x : x
            const dy = absolute ? y - obj.y : y
            if (absolute) {
                obj.x = x
                obj.y = y
            } else {
                obj.x += x
                obj.y += y
            }
            obj.element.css('transform', `translate(${obj.x}px, ${obj.y}px)`)
            obj.linkedWith.forEach((linkedObj) => {
                moveObject(linkedObj, dx, dy, false)
            })
        }

        function isOnWorld(obj) {
            if (self.objects['island'] === undefined) return true
            const width = parseFloat(self.objects['island'].element.css('--cb-fw-width'))
            const padding = parseFloat(self.objects['island'].element.css('--cb-fw-padding'))

            const wminx = padding + self.objects['island'].x
            const wmaxx = padding + width + self.objects['island'].x

            console.log("IsOnWorld", wminx, obj.x, wmaxx)
            if (obj.x < wminx || obj.x > wmaxx) return false
            return true
        }

        function hasCherry(obj) {
            if (self.objects['cherry'] === undefined || self.objects['cherry'].isPicked || obj.type !== "Player") return false

            const width = 64
            const pminx = obj.x - width
            const pmaxx = obj.x + width

            //console.log("hasCherry", pminx, self.objects['cherry'].x, pmaxx)
            if (self.objects['cherry'].x > pminx && self.objects['cherry'].x < pmaxx) return true
            return false
        }

        function checkFall(obj) {
            if (hasCherry(obj)) {
                self.objects['cherry'].isPicked = true
                setTimeout(() => {
                    moveObject(self.objects['cherry'], obj.x, obj.y - 210, true)
                }, 200)
                obj.linkedWith.push(self.objects['cherry'])

                //remove cherry from island.linkedWith
                const idx = self.objects['island'].linkedWith.indexOf(self.objects['cherry'])
                if (idx >= 0) {
                    self.objects['island'].linkedWith.splice(idx, 1)
                }
                return
            }
            if (!isOnWorld(obj)) {
                const height = parseFloat(self.objects['island'].element.css('--cb-fw-height'))
                moveObject(obj, obj.x, height + 230)
            }
        }

        if (cmdName === 'show') {
            const worldElement = $('<div class="islandcontainer animated fast"><div class="island"></div><div class="tree"></div><div class="grass a"></div><div class="grass b"></div><div class="stone"></div></div><div class="cherry animated"></div>')
            this.world.append(worldElement)

            this.objects['cherry'] = {
                element: this.world.find('.cherry'),
                x: 340,
                y: 350,
                type: 'Cherry',
                linkedWith: [],
                isPicked: false
            }
            this.objects['island'] = {
                element: this.world.find('.islandcontainer'),
                x: 0,
                y: 0,
                type: 'Island',
                linkedWith: [this.objects['cherry']]
            }
        } else if (cmdName === 'new') {
            hasDelay = false
            this.objects[cmd.object.id] = cmd.object
            if (cmd.object.type === 'Player') {
                this.objects[cmd.object.id].didAdd = false
                this.objects[cmd.object.id].linkedWith = []
                this.objects[cmd.object.id].element = undefined
                this.objects[cmd.object.id].ghost = undefined
                if (this.playerCount === 0) {
                    this.objects[cmd.object.id].x = 480
                    this.objects[cmd.object.id].y = 390
                } else if (this.playerCount === 1) {
                    this.objects[cmd.object.id].x = 80
                    this.objects[cmd.object.id].y = 390
                } else {
                    this.objects[cmd.object.id].x = Math.random() * 400 + 80
                    this.objects[cmd.object.id].y = Math.random() * 10 + 380
                }

                this.playerCount++
            }
        } else if (cmdName === 'addPlayer') {
            const player = this.objects[cmd.object.id]
            console.log("Player", cmd, player, this.objects)
            if (player && !(player.didAdd === true)) {
                const playerElement = $(document.createElement('div'))
                player.element = playerElement
                playerElement.addClass('player')
                playerElement.addClass('transparent')
                playerElement.addClass(((player.playerType % 2) === 0) ? 'a' : 'b')
                playerElement.css('transform', `translate(${player.x}px, ${player.y}px)`)
                this.world.append(playerElement)
                playerElement.addClass('animated')
                setTimeout(() => {
                    playerElement.removeClass('transparent')
                    checkFall(player)
                }, 1)
            }
        } else if (cmdName === 'removePlayer') {
            const player = this.objects[cmd.object.id]
            if (player) {
                //remove cherry from island.linkedWith
                const idx = player.linkedWith.indexOf(self.objects['cherry'])
                if (idx >= 0) {
                    player.linkedWith.splice(idx, 1)
                    self.objects['island'].linkedWith.push(self.objects['cherry'])
                    self.objects['cherry'].isPicked = false
                    moveObject(self.objects['cherry'], self.objects['cherry'].x, 390, true)
                }

                if (player.element) player.element.remove()
                if (player.ghost) player.ghost.remove()
                delete this.objects[cmd.object.id]
            }
        } else if (cmdName === 'moveIsland') {
            const island = this.objects['island']
            if (island) {
                if (this.objects['island-ghost'] === undefined) {
                    this.objects['island-ghost'] = {
                        element: $('<div class="island ghost animated transparent"></div>'),
                        x: 0,
                        y: 0,
                        type: 'Island'
                    }
                    setTimeout(() => {
                        this.objects['island-ghost'].element.removeClass('transparent')
                    }, 1)
                    this.world.append(this.objects['island-ghost'].element)
                }

                moveObject(island, cmd.value, 0, false)
                for (const key in this.objects) {
                    const obj = this.objects[key]
                    if (obj.type === 'Player' || (obj.type === 'Cherry' && !obj.isPicked)) {
                        checkFall(obj)
                    }
                }
            }
        } else if (cmdName === 'movePlayer') {
            const player = this.objects[cmd.object.id]
            if (player) {
                if (player.ghost === undefined) {
                    player.ghost = {
                        element: $(document.createElement('div')),
                        x: player.x,
                        y: player.y,
                        type: 'Player'
                    }
                    player.ghost.element.addClass('player ghost animated transparent')
                    player.ghost.element.addClass(((player.playerType % 2) === 0) ? 'a' : 'b')
                    player.ghost.element.css('transform', `translate(${player.x}px, ${player.y}px)`)
                    this.world.append(player.ghost.element)
                    setTimeout(() => {
                        player.ghost.element.removeClass('transparent')
                    }, 1)
                }
                moveObject(player, cmd.value, 0, false)
                checkFall(player)
            }
        }
        this.commandTimer = setTimeout(() => {
            this.runCommand(commands, idx + 1)
        }, hasDelay ? this.commandDelay : 0)
    }
}