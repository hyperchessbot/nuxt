import {Chess} from "./chessops/chess"

import {parseSan} from "./chessops/san"

import {makeFen} from "./chessops/fen"

const chess = Chess.default();

console.log(chess);

const san = "Nf3"

const move = parseSan(chess, san)

console.log(move)

chess.play(move)

console.log(chess);

const fen = makeFen(chess.toSetup())

console.log(fen)