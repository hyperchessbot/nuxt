import {Chess} from "./chessops/chess"

import {parseSan, makeSan} from "./chessops/san"

import {makeFen, parseFen} from "./chessops/fen"

import {parseUci, makeUci} from "./chessops/util";

import {Verbose, Framework, log} from "./utils";

Verbose()

const framework = Framework()

log(framework)

// Pos_ is an abstraction of a chess position
export class Pos_{
    constructor(){
        // initialize to standard chess starting position
        this.pos = new Chess()
    }

    setVariant(variant){
        this.pos = new Chess(variant)
        return this
    }

    setFen(fen){
        const variant = this.pos.rules
        const setup = parseFen(fen).value        
        this.pos = Chess.fromSetup(setup).value    
        this.pos.rules = variant
        return this
    }

    reportFen(){
        return makeFen(this.pos.toSetup())
    }

    sanToMove(san){
        return parseSan(this.pos, san)
    }

    moveToSan(move){
        return makeSan(this.pos, move)
    }

    uciToMove(uci){
        return parseUci(uci)
    }

    moveToUci(move){
        return makeUci(move)
    }

    play(move){
        this.pos.play(move)
        return this
    }

    playSan(san){
        return this.play(this.sanToMove(san))
    }

    playUci(uci){
        return this.play(this.uciToMove(uci))
    }

    sanToUci(san){
        return this.moveToUci(this.sanToMove(san))
    }

    uciToSan(uci){
        return this.moveToSan(this.uciToMove(uci))
    }

    toString(){
        return `[Pos ${this.pos.rules} ${this.reportFen()}]`
    }
}
export function Pos(){
    return new Pos_()
}

const pos = Pos().setVariant("atomic").setFen("rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1")

pos.playUci("d7d5")

log(pos.sanToUci("Nc3"))
log(pos.uciToSan("b1a3"))

console.log(pos.reportFen())

