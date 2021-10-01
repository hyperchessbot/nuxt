import {Chess} from "./chessops/chess"

import {parseSan} from "./chessops/san"

import {makeFen, parseFen} from "./chessops/fen"

import { Verbose, Framework, log } from "./utils";

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

    play(move){
        this.pos.play(move)
        return this
    }

    playSan(san){
        return this.play(this.sanToMove(san))
    }

    toString(){
        return `[Pos ${this.pos.rules} ${this.reportFen()}]`
    }
}
export function Pos(){
    return new Pos_()
}

const pos = Pos().setVariant("atomic").setFen("rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1")

pos.playSan("d5")

console.log(pos.reportFen())

