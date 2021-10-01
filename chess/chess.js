import {Chess} from "./chessops/chess"

import {parseSan} from "./chessops/san"

import {makeFen} from "./chessops/fen"

import { Verbose, Framework, log } from "./utils";

Verbose()

const framework = Framework()

log(framework)

// Pos_ is an abstraction of a chess position
export class Pos_{
    constructor(){
        // initialize to standard chess starting position
        this.pos = Chess.default()
    }

    setVariant(variant){
        this.pos = new Chess(variant)
        return this
    }

    setFen(fen){
        this.pos.fromSetup()
    }
}
export function Pos(){
    return new Pos_()
}

const pos = Pos().setVariant("atomic")

console.log(pos)

const chess = Chess.default();

const san = "Nf3"

const move = parseSan(chess, san)

console.log(move)

chess.play(move)

const fen = makeFen(chess.toSetup())

console.log(fen)