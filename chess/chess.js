import {Chess} from "./chessops/chess"

import {Atomic, Antichess, Crazyhouse, Horde, KingOfTheHill, RacingKings, ThreeCheck} from "./chessops/variant"

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
        switch(variant){
            case "atomic": this.pos = new Atomic(); break;
            case "antichess": this.pos = new Antichess(); break;
            case "crazyhouse": this.pos = new Crazyhouse(); break;
            case "horde": this.pos = new Horde(); break;
            case "kingofthehill": this.pos = new KingOfTheHill(); break;
            case "racingkings": this.pos = new RacingKings(); break;
            case "3check": case "threecheck": this.pos = new ThreeCheck(); break;
            default: this.pos = new Chess()
        }
        return this
    }

    setFen(fen){
        const variant = this.pos.rules
        const setup = parseFen(fen).value        
        switch(variant){
            case "atomic": this.pos = Atomic.fromSetup(setup).value; break;
            case "antichess": this.pos = Antichess.fromSetup(setup).value; break;            
            case "crazyhouse": this.pos = Crazyhouse.fromSetup(setup).value; break;
            case "horde": this.pos = Horde.fromSetup(setup).value; break;
            case "kingofthehill": this.pos = KingOfTheHill.fromSetup(setup).value; break;
            case "racingkings": this.pos = RacingKings.fromSetup(setup).value; break;
            case "3check": case "threecheck": this.pos = KingOfTheHill.fromSetup(setup).value; break;
            default: this.pos = Chess.fromSetup(setup).value
        }        
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

pos.playSan("e5")
pos.playSan("Nxe5")

console.log(pos, pos.reportFen())

