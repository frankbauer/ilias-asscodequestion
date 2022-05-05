let spriteSerial = 10000000
class Sprite {
    type
    mapGame
    uID
    row
    column
    removed

    constructor() {
        var args = [...arguments]
        this.removed = false

        let registerWithGame
        let uIDPrefix = 'sprite_'
        if (args.length === 4) {
            this.mapGame = args[0]
            registerWithGame = true
            this.type = args[1]
            this.row = args[2]
            this.column = args[3]
        } else if (args.length === 5) {
            this.mapGame = args[0]
            registerWithGame = args[1]
            this.type = args[2]
            this.row = args[3]
            this.column = args[4]
        } else if (args.length === 6) {
            uIDPrefix = args[0]
            this.mapGame = args[1]
            registerWithGame = args[2]
            this.type = args[3]
            this.row = args[4]
            this.column = args[5]
        }

        this.uID = uIDPrefix + spriteSerial++

        if (this.mapGame != null && registerWithGame) {
            //register needs to take care of Figure vs. Sprite
            this.mapGame.register(this)
        }
    }

    getColumn() {
        return this.column
    }

    getRow() {
        return this.row
    }

    wasRemoved() {
        return this.removed
    }

    moveToTile(c, r) {
        this.row = r
        this.column = c
        this._postMoveCommand(c, r, 'moveToTile')
    }

    moveTo(x, y) {
        this._postMoveCommand(x, y, 'moveTo')
    }

    remove() {
        //remove needs to take care of Figure vs. Sprite
        this.mapGame._remove(this)
        this.removed = true
    }

    _postMoveCommand(x, y, moveTo) {
        let reply = {
            command: moveTo,
            c: x,
            r: y,
            ID: this.uID,
        }
        CodeBlocks.postMessage(reply)
    }

    test() {
        console.log('sprite test')
    }
}

class Figure extends Sprite {}

class AnimatedSprite extends Sprite {}

class MapGame {
    rows
    columns
    gameHandler
    figureHandler
    animHandler
    handler
    figures
    sprites

    constructor(args, gameHandler, figureHandler, animHandler, handler) {
        this.figures = []
        this.sprites = []

        this.gameHandler = gameHandler === undefined ? this : gameHandler
        this.figureHandler = figureHandler === undefined ? this : figureHandler
        this.animHandler = animHandler === undefined ? this : animHandler

        if (args.length < 3) {
            throw new Error('Failed to create Game. Not enough Arguments supplied.')
        }

        if (!'isometric' == args[0]) {
            throw new Error('Failed to create Game. Unknown Game Type.')
        }

        this.columns = +args[1]
        this.rows = +args[2]

        CodeBlocks.startReceivingEvents(this.onMessage)
    }

    onMessage(request) {
        console.log('Received: ' + request)
    }
}

const PhaserInterop = {
    Sprite: Sprite,
    Figure: Figure,
    AnimatedSprite: AnimatedSprite,
    MapGame: MapGame,
}
