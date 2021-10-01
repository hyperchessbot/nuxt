'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function r(r,n){r.prototype=Object.create(n.prototype),r.prototype.constructor=r,r.__proto__=n;}var n,t=function(){function r(){}var t=r.prototype;return t.unwrap=function(r,t){var o=this._chain(function(t){return n.ok(r?r(t):t)},function(r){return t?n.ok(t(r)):n.err(r)});if(o.isErr)throw o.error;return o.value},t.map=function(r,t){return this._chain(function(t){return n.ok(r(t))},function(r){return n.err(t?t(r):r)})},t.chain=function(r,t){return this._chain(r,t||function(r){return n.err(r)})},r}(),o=function(n){function t(r){var t;return (t=n.call(this)||this).value=r,t.isOk=!0,t.isErr=!1,t}return r(t,n),t.prototype._chain=function(r,n){return r(this.value)},t}(t),e=function(n){function t(r){var t;return (t=n.call(this)||this).error=r,t.isOk=!1,t.isErr=!0,t}return r(t,n),t.prototype._chain=function(r,n){return n(this.error)},t}(t);!function(r){r.ok=function(r){return new o(r)},r.err=function(r){return new e(r||new Error)},r.all=function(n){if(Array.isArray(n)){for(var t=[],o=0;o<n.length;o++){var e=n[o];if(e.isErr)return e;t.push(e.value);}return r.ok(t)}for(var u={},i=Object.keys(n),c=0;c<i.length;c++){var a=n[i[c]];if(a.isErr)return a;u[i[c]]=a.value;}return r.ok(u)};}(n||(n={}));

const FILE_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANK_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8'];
const COLORS = ['white', 'black'];
const ROLES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const CASTLING_SIDES = ['a', 'h'];
function isDrop(v) {
    return 'role' in v;
}

function popcnt32(n) {
    n = n - ((n >>> 1) & 1431655765);
    n = (n & 858993459) + ((n >>> 2) & 858993459);
    return Math.imul((n + (n >>> 4)) & 252645135, 16843009) >> 24;
}
function bswap32(n) {
    n = ((n >>> 8) & 16711935) | ((n & 16711935) << 8);
    return ((n >>> 16) & 0xffff) | ((n & 0xffff) << 16);
}
function rbit32(n) {
    n = ((n >>> 1) & 1431655765) | ((n & 1431655765) << 1);
    n = ((n >>> 2) & 858993459) | ((n & 858993459) << 2);
    n = ((n >>> 4) & 252645135) | ((n & 252645135) << 4);
    return bswap32(n);
}
class SquareSet {
    constructor(lo, hi) {
        this.lo = lo;
        this.hi = hi;
        this.lo = lo | 0;
        this.hi = hi | 0;
    }
    static fromSquare(square) {
        return square >= 32 ? new SquareSet(0, 1 << (square - 32)) : new SquareSet(1 << square, 0);
    }
    static fromRank(rank) {
        return new SquareSet(0xff, 0).shl64(8 * rank);
    }
    static fromFile(file) {
        return new SquareSet(16843009 << file, 16843009 << file);
    }
    static empty() {
        return new SquareSet(0, 0);
    }
    static full() {
        return new SquareSet(4294967295, 4294967295);
    }
    static corners() {
        return new SquareSet(0x81, 2164260864);
    }
    static center() {
        return new SquareSet(402653184, 0x18);
    }
    static backranks() {
        return new SquareSet(0xff, 4278190080);
    }
    static backrank(color) {
        return color === 'white' ? new SquareSet(0xff, 0) : new SquareSet(0, 4278190080);
    }
    static lightSquares() {
        return new SquareSet(1437226410, 1437226410);
    }
    static darkSquares() {
        return new SquareSet(2857740885, 2857740885);
    }
    complement() {
        return new SquareSet(~this.lo, ~this.hi);
    }
    xor(other) {
        return new SquareSet(this.lo ^ other.lo, this.hi ^ other.hi);
    }
    union(other) {
        return new SquareSet(this.lo | other.lo, this.hi | other.hi);
    }
    intersect(other) {
        return new SquareSet(this.lo & other.lo, this.hi & other.hi);
    }
    diff(other) {
        return new SquareSet(this.lo & ~other.lo, this.hi & ~other.hi);
    }
    intersects(other) {
        return this.intersect(other).nonEmpty();
    }
    isDisjoint(other) {
        return this.intersect(other).isEmpty();
    }
    supersetOf(other) {
        return other.diff(this).isEmpty();
    }
    subsetOf(other) {
        return this.diff(other).isEmpty();
    }
    shr64(shift) {
        if (shift >= 64)
            return SquareSet.empty();
        if (shift >= 32)
            return new SquareSet(this.hi >>> (shift - 32), 0);
        if (shift > 0)
            return new SquareSet((this.lo >>> shift) ^ (this.hi << (32 - shift)), this.hi >>> shift);
        return this;
    }
    shl64(shift) {
        if (shift >= 64)
            return SquareSet.empty();
        if (shift >= 32)
            return new SquareSet(0, this.lo << (shift - 32));
        if (shift > 0)
            return new SquareSet(this.lo << shift, (this.hi << shift) ^ (this.lo >>> (32 - shift)));
        return this;
    }
    bswap64() {
        return new SquareSet(bswap32(this.hi), bswap32(this.lo));
    }
    rbit64() {
        return new SquareSet(rbit32(this.hi), rbit32(this.lo));
    }
    minus64(other) {
        const lo = this.lo - other.lo;
        const c = ((lo & other.lo & 1) + (other.lo >>> 1) + (lo >>> 1)) >>> 31;
        return new SquareSet(lo, this.hi - (other.hi + c));
    }
    equals(other) {
        return this.lo === other.lo && this.hi === other.hi;
    }
    size() {
        return popcnt32(this.lo) + popcnt32(this.hi);
    }
    isEmpty() {
        return this.lo === 0 && this.hi === 0;
    }
    nonEmpty() {
        return this.lo !== 0 || this.hi !== 0;
    }
    has(square) {
        return (square >= 32 ? this.hi & (1 << (square - 32)) : this.lo & (1 << square)) !== 0;
    }
    set(square, on) {
        return on ? this.with(square) : this.without(square);
    }
    with(square) {
        return square >= 32
            ? new SquareSet(this.lo, this.hi | (1 << (square - 32)))
            : new SquareSet(this.lo | (1 << square), this.hi);
    }
    without(square) {
        return square >= 32
            ? new SquareSet(this.lo, this.hi & ~(1 << (square - 32)))
            : new SquareSet(this.lo & ~(1 << square), this.hi);
    }
    toggle(square) {
        return square >= 32
            ? new SquareSet(this.lo, this.hi ^ (1 << (square - 32)))
            : new SquareSet(this.lo ^ (1 << square), this.hi);
    }
    last() {
        if (this.hi !== 0)
            return 63 - Math.clz32(this.hi);
        if (this.lo !== 0)
            return 31 - Math.clz32(this.lo);
        return;
    }
    first() {
        if (this.lo !== 0)
            return 31 - Math.clz32(this.lo & -this.lo);
        if (this.hi !== 0)
            return 63 - Math.clz32(this.hi & -this.hi);
        return;
    }
    withoutFirst() {
        if (this.lo !== 0)
            return new SquareSet(this.lo & (this.lo - 1), this.hi);
        return new SquareSet(0, this.hi & (this.hi - 1));
    }
    moreThanOne() {
        return (this.hi !== 0 && this.lo !== 0) || (this.lo & (this.lo - 1)) !== 0 || (this.hi & (this.hi - 1)) !== 0;
    }
    singleSquare() {
        return this.moreThanOne() ? undefined : this.last();
    }
    isSingleSquare() {
        return this.nonEmpty() && !this.moreThanOne();
    }
    *[Symbol.iterator]() {
        let lo = this.lo;
        let hi = this.hi;
        while (lo !== 0) {
            const idx = 31 - Math.clz32(lo & -lo);
            lo ^= 1 << idx;
            yield idx;
        }
        while (hi !== 0) {
            const idx = 31 - Math.clz32(hi & -hi);
            hi ^= 1 << idx;
            yield 32 + idx;
        }
    }
    *reversed() {
        let lo = this.lo;
        let hi = this.hi;
        while (hi !== 0) {
            const idx = 31 - Math.clz32(hi);
            hi ^= 1 << idx;
            yield 32 + idx;
        }
        while (lo !== 0) {
            const idx = 31 - Math.clz32(lo);
            lo ^= 1 << idx;
            yield idx;
        }
    }
}

/**
 * Piece positions on a board.
 *
 * Properties are sets of squares, like `board.occupied` for all occupied
 * squares, `board[color]` for all pieces of that color, and `board[role]`
 * for all pieces of that role. When modifying the properties directly, take
 * care to keep them consistent.
 */
class Board {
    constructor() { }
    static default() {
        const board = new Board();
        board.reset();
        return board;
    }
    static racingKings() {
        const board = new Board();
        board.occupied = new SquareSet(0xffff, 0);
        board.promoted = SquareSet.empty();
        board.white = new SquareSet(0xf0f0, 0);
        board.black = new SquareSet(0x0f0f, 0);
        board.pawn = SquareSet.empty();
        board.knight = new SquareSet(0x1818, 0);
        board.bishop = new SquareSet(0x2424, 0);
        board.rook = new SquareSet(0x4242, 0);
        board.queen = new SquareSet(0x0081, 0);
        board.king = new SquareSet(0x8100, 0);
        return board;
    }
    static horde() {
        const board = new Board();
        board.occupied = new SquareSet(4294967295, 4294901862);
        board.promoted = SquareSet.empty();
        board.white = new SquareSet(4294967295, 102);
        board.black = new SquareSet(0, 4294901760);
        board.pawn = new SquareSet(4294967295, 16711782);
        board.knight = new SquareSet(0, 1107296256);
        board.bishop = new SquareSet(0, 603979776);
        board.rook = new SquareSet(0, 2164260864);
        board.queen = new SquareSet(0, 134217728);
        board.king = new SquareSet(0, 268435456);
        return board;
    }
    /**
     * Resets all pieces to the default starting position for standard chess.
     */
    reset() {
        this.occupied = new SquareSet(0xffff, 4294901760);
        this.promoted = SquareSet.empty();
        this.white = new SquareSet(0xffff, 0);
        this.black = new SquareSet(0, 4294901760);
        this.pawn = new SquareSet(0xff00, 16711680);
        this.knight = new SquareSet(0x42, 1107296256);
        this.bishop = new SquareSet(0x24, 603979776);
        this.rook = new SquareSet(0x81, 2164260864);
        this.queen = new SquareSet(0x8, 134217728);
        this.king = new SquareSet(0x10, 268435456);
    }
    static empty() {
        const board = new Board();
        board.clear();
        return board;
    }
    clear() {
        this.occupied = SquareSet.empty();
        this.promoted = SquareSet.empty();
        for (const color of COLORS)
            this[color] = SquareSet.empty();
        for (const role of ROLES)
            this[role] = SquareSet.empty();
    }
    clone() {
        const board = new Board();
        board.occupied = this.occupied;
        board.promoted = this.promoted;
        for (const color of COLORS)
            board[color] = this[color];
        for (const role of ROLES)
            board[role] = this[role];
        return board;
    }
    equalsIgnorePromoted(other) {
        if (!this.white.equals(other.white))
            return false;
        return ROLES.every(role => this[role].equals(other[role]));
    }
    equals(other) {
        return this.equalsIgnorePromoted(other) && this.promoted.equals(other.promoted);
    }
    getColor(square) {
        if (this.white.has(square))
            return 'white';
        if (this.black.has(square))
            return 'black';
        return;
    }
    getRole(square) {
        for (const role of ROLES) {
            if (this[role].has(square))
                return role;
        }
        return;
    }
    get(square) {
        const color = this.getColor(square);
        if (!color)
            return;
        const role = this.getRole(square);
        const promoted = this.promoted.has(square);
        return { color, role, promoted };
    }
    /**
     * Removes and returns the piece from the given `square`, if any.
     */
    take(square) {
        const piece = this.get(square);
        if (piece) {
            this.occupied = this.occupied.without(square);
            this[piece.color] = this[piece.color].without(square);
            this[piece.role] = this[piece.role].without(square);
            if (piece.promoted)
                this.promoted = this.promoted.without(square);
        }
        return piece;
    }
    /**
     * Put `piece` onto `square`, potentially replacing an existing piece.
     * Returns the existing piece, if any.
     */
    set(square, piece) {
        const old = this.take(square);
        this.occupied = this.occupied.with(square);
        this[piece.color] = this[piece.color].with(square);
        this[piece.role] = this[piece.role].with(square);
        if (piece.promoted)
            this.promoted = this.promoted.with(square);
        return old;
    }
    has(square) {
        return this.occupied.has(square);
    }
    *[Symbol.iterator]() {
        for (const square of this.occupied) {
            yield [square, this.get(square)];
        }
    }
    pieces(color, role) {
        return this[color].intersect(this[role]);
    }
    rooksAndQueens() {
        return this.rook.union(this.queen);
    }
    bishopsAndQueens() {
        return this.bishop.union(this.queen);
    }
    /**
     * Finds the unique unpromoted king of the given `color`, if any.
     */
    kingOf(color) {
        return this.king.intersect(this[color]).diff(this.promoted).singleSquare();
    }
}

function defined(v) {
    return v !== undefined;
}
function opposite(color) {
    return color === 'white' ? 'black' : 'white';
}
function squareRank(square) {
    return square >> 3;
}
function squareFile(square) {
    return square & 0x7;
}
function roleToChar(role) {
    switch (role) {
        case 'pawn':
            return 'p';
        case 'knight':
            return 'n';
        case 'bishop':
            return 'b';
        case 'rook':
            return 'r';
        case 'queen':
            return 'q';
        case 'king':
            return 'k';
    }
}
function charToRole(ch) {
    switch (ch) {
        case 'P':
        case 'p':
            return 'pawn';
        case 'N':
        case 'n':
            return 'knight';
        case 'B':
        case 'b':
            return 'bishop';
        case 'R':
        case 'r':
            return 'rook';
        case 'Q':
        case 'q':
            return 'queen';
        case 'K':
        case 'k':
            return 'king';
        default:
            return;
    }
}
function parseSquare(str) {
    if (str.length !== 2)
        return;
    const file = str.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = str.charCodeAt(1) - '1'.charCodeAt(0);
    if (file < 0 || file >= 8 || rank < 0 || rank >= 8)
        return;
    return file + 8 * rank;
}
function makeSquare(square) {
    return (FILE_NAMES[squareFile(square)] + RANK_NAMES[squareRank(square)]);
}
function kingCastlesTo(color, side) {
    return color === 'white' ? (side === 'a' ? 2 : 6) : side === 'a' ? 58 : 62;
}

/**
 * Compute attacks and rays.
 *
 * These are low-level functions that can be used to implement chess rules.
 *
 * Implementation notes: Sliding attacks are computed using
 * [hyperbola quintessence](https://www.chessprogramming.org/Hyperbola_Quintessence).
 * Magic bitboards would deliver faster lookups, but also require
 * initializing considerably larger attack tables. On the web, initialization
 * time is important, so the chosen method may strike a better balance.
 *
 * @packageDocumentation
 */
function computeRange(square, deltas) {
    let range = SquareSet.empty();
    for (const delta of deltas) {
        const sq = square + delta;
        if (0 <= sq && sq < 64 && Math.abs(squareFile(square) - squareFile(sq)) <= 2) {
            range = range.with(sq);
        }
    }
    return range;
}
function tabulate(f) {
    const table = [];
    for (let square = 0; square < 64; square++)
        table[square] = f(square);
    return table;
}
const KING_ATTACKS = tabulate(sq => computeRange(sq, [-9, -8, -7, -1, 1, 7, 8, 9]));
const KNIGHT_ATTACKS = tabulate(sq => computeRange(sq, [-17, -15, -10, -6, 6, 10, 15, 17]));
const PAWN_ATTACKS = {
    white: tabulate(sq => computeRange(sq, [7, 9])),
    black: tabulate(sq => computeRange(sq, [-7, -9])),
};
/**
 * Gets squares attacked or defended by a king on `square`.
 */
function kingAttacks(square) {
    return KING_ATTACKS[square];
}
/**
 * Gets squares attacked or defended by a knight on `square`.
 */
function knightAttacks(square) {
    return KNIGHT_ATTACKS[square];
}
/**
 * Gets squares attacked or defended by a pawn of the given `color`
 * on `square`.
 */
function pawnAttacks(color, square) {
    return PAWN_ATTACKS[color][square];
}
const FILE_RANGE = tabulate(sq => SquareSet.fromFile(squareFile(sq)).without(sq));
const RANK_RANGE = tabulate(sq => SquareSet.fromRank(squareRank(sq)).without(sq));
const DIAG_RANGE = tabulate(sq => {
    const diag = new SquareSet(134480385, 2151686160);
    const shift = 8 * (squareRank(sq) - squareFile(sq));
    return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
});
const ANTI_DIAG_RANGE = tabulate(sq => {
    const diag = new SquareSet(270549120, 16909320);
    const shift = 8 * (squareRank(sq) + squareFile(sq) - 7);
    return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
});
function hyperbola(bit, range, occupied) {
    let forward = occupied.intersect(range);
    let reverse = forward.bswap64(); // Assumes no more than 1 bit per rank
    forward = forward.minus64(bit);
    reverse = reverse.minus64(bit.bswap64());
    return forward.xor(reverse.bswap64()).intersect(range);
}
function fileAttacks(square, occupied) {
    return hyperbola(SquareSet.fromSquare(square), FILE_RANGE[square], occupied);
}
function rankAttacks(square, occupied) {
    const range = RANK_RANGE[square];
    let forward = occupied.intersect(range);
    let reverse = forward.rbit64();
    forward = forward.minus64(SquareSet.fromSquare(square));
    reverse = reverse.minus64(SquareSet.fromSquare(63 - square));
    return forward.xor(reverse.rbit64()).intersect(range);
}
/**
 * Gets squares attacked or defended by a bishop on `square`, given `occupied`
 * squares.
 */
function bishopAttacks(square, occupied) {
    const bit = SquareSet.fromSquare(square);
    return hyperbola(bit, DIAG_RANGE[square], occupied).xor(hyperbola(bit, ANTI_DIAG_RANGE[square], occupied));
}
/**
 * Gets squares attacked or defended by a rook on `square`, given `occupied`
 * squares.
 */
function rookAttacks(square, occupied) {
    return fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
}
/**
 * Gets squares attacked or defended by a queen on `square`, given `occupied`
 * squares.
 */
function queenAttacks(square, occupied) {
    return bishopAttacks(square, occupied).xor(rookAttacks(square, occupied));
}
/**
 * Gets squares attacked or defended by a `piece` on `square`, given
 * `occupied` squares.
 */
function attacks(piece, square, occupied) {
    switch (piece.role) {
        case 'pawn':
            return pawnAttacks(piece.color, square);
        case 'knight':
            return knightAttacks(square);
        case 'bishop':
            return bishopAttacks(square, occupied);
        case 'rook':
            return rookAttacks(square, occupied);
        case 'queen':
            return queenAttacks(square, occupied);
        case 'king':
            return kingAttacks(square);
    }
}
/**
 * Gets all squares of the rank, file or diagonal with the two squares
 * `a` and `b`, or an empty set if they are not aligned.
 */
function ray(a, b) {
    const other = SquareSet.fromSquare(b);
    if (RANK_RANGE[a].intersects(other))
        return RANK_RANGE[a].with(a);
    if (ANTI_DIAG_RANGE[a].intersects(other))
        return ANTI_DIAG_RANGE[a].with(a);
    if (DIAG_RANGE[a].intersects(other))
        return DIAG_RANGE[a].with(a);
    if (FILE_RANGE[a].intersects(other))
        return FILE_RANGE[a].with(a);
    return SquareSet.empty();
}
/**
 * Gets all squares between `a` and `b` (bounds not included), or an empty set
 * if they are not on the same rank, file or diagonal.
 */
function between(a, b) {
    return ray(a, b)
        .intersect(SquareSet.full().shl64(a).xor(SquareSet.full().shl64(b)))
        .withoutFirst();
}

var IllegalSetup;
(function (IllegalSetup) {
    IllegalSetup["Empty"] = "ERR_EMPTY";
    IllegalSetup["OppositeCheck"] = "ERR_OPPOSITE_CHECK";
    IllegalSetup["ImpossibleCheck"] = "ERR_IMPOSSIBLE_CHECK";
    IllegalSetup["PawnsOnBackrank"] = "ERR_PAWNS_ON_BACKRANK";
    IllegalSetup["Kings"] = "ERR_KINGS";
    IllegalSetup["Variant"] = "ERR_VARIANT";
})(IllegalSetup || (IllegalSetup = {}));
class PositionError extends Error {
}
function attacksTo(square, attacker, board, occupied) {
    return board[attacker].intersect(rookAttacks(square, occupied)
        .intersect(board.rooksAndQueens())
        .union(bishopAttacks(square, occupied).intersect(board.bishopsAndQueens()))
        .union(knightAttacks(square).intersect(board.knight))
        .union(kingAttacks(square).intersect(board.king))
        .union(pawnAttacks(opposite(attacker), square).intersect(board.pawn)));
}
function rookCastlesTo(color, side) {
    return color === 'white' ? (side === 'a' ? 3 : 5) : side === 'a' ? 59 : 61;
}
class Castles {
    constructor() { }
    static default() {
        const castles = new Castles();
        castles.unmovedRooks = SquareSet.corners();
        castles.rook = {
            white: { a: 0, h: 7 },
            black: { a: 56, h: 63 },
        };
        castles.path = {
            white: { a: new SquareSet(0xe, 0), h: new SquareSet(0x60, 0) },
            black: { a: new SquareSet(0, 0x0e000000), h: new SquareSet(0, 0x60000000) },
        };
        return castles;
    }
    static empty() {
        const castles = new Castles();
        castles.unmovedRooks = SquareSet.empty();
        castles.rook = {
            white: { a: undefined, h: undefined },
            black: { a: undefined, h: undefined },
        };
        castles.path = {
            white: { a: SquareSet.empty(), h: SquareSet.empty() },
            black: { a: SquareSet.empty(), h: SquareSet.empty() },
        };
        return castles;
    }
    clone() {
        const castles = new Castles();
        castles.unmovedRooks = this.unmovedRooks;
        castles.rook = {
            white: { a: this.rook.white.a, h: this.rook.white.h },
            black: { a: this.rook.black.a, h: this.rook.black.h },
        };
        castles.path = {
            white: { a: this.path.white.a, h: this.path.white.h },
            black: { a: this.path.black.a, h: this.path.black.h },
        };
        return castles;
    }
    add(color, side, king, rook) {
        const kingTo = kingCastlesTo(color, side);
        const rookTo = rookCastlesTo(color, side);
        this.unmovedRooks = this.unmovedRooks.with(rook);
        this.rook[color][side] = rook;
        this.path[color][side] = between(rook, rookTo)
            .with(rookTo)
            .union(between(king, kingTo).with(kingTo))
            .without(king)
            .without(rook);
    }
    static fromSetup(setup) {
        const castles = Castles.empty();
        const rooks = setup.unmovedRooks.intersect(setup.board.rook);
        for (const color of COLORS) {
            const backrank = SquareSet.backrank(color);
            const king = setup.board.kingOf(color);
            if (!defined(king) || !backrank.has(king))
                continue;
            const side = rooks.intersect(setup.board[color]).intersect(backrank);
            const aSide = side.first();
            if (defined(aSide) && aSide < king)
                castles.add(color, 'a', king, aSide);
            const hSide = side.last();
            if (defined(hSide) && king < hSide)
                castles.add(color, 'h', king, hSide);
        }
        return castles;
    }
    discardRook(square) {
        if (this.unmovedRooks.has(square)) {
            this.unmovedRooks = this.unmovedRooks.without(square);
            for (const color of COLORS) {
                for (const side of CASTLING_SIDES) {
                    if (this.rook[color][side] === square)
                        this.rook[color][side] = undefined;
                }
            }
        }
    }
    discardSide(color) {
        this.unmovedRooks = this.unmovedRooks.diff(SquareSet.backrank(color));
        this.rook[color].a = undefined;
        this.rook[color].h = undefined;
    }
}
class Position {
    constructor(rules) {
        this.rules = rules;
    }
    kingAttackers(square, attacker, occupied) {
        return attacksTo(square, attacker, this.board, occupied);
    }
    dropDests(_ctx) {
        return SquareSet.empty();
    }
    playCaptureAt(square, captured) {
        this.halfmoves = 0;
        if (captured.role === 'rook')
            this.castles.discardRook(square);
        if (this.pockets)
            this.pockets[opposite(captured.color)][captured.role]++;
    }
    ctx() {
        const variantEnd = this.isVariantEnd();
        const king = this.board.kingOf(this.turn);
        if (!defined(king))
            return { king, blockers: SquareSet.empty(), checkers: SquareSet.empty(), variantEnd, mustCapture: false };
        const snipers = rookAttacks(king, SquareSet.empty())
            .intersect(this.board.rooksAndQueens())
            .union(bishopAttacks(king, SquareSet.empty()).intersect(this.board.bishopsAndQueens()))
            .intersect(this.board[opposite(this.turn)]);
        let blockers = SquareSet.empty();
        for (const sniper of snipers) {
            const b = between(king, sniper).intersect(this.board.occupied);
            if (!b.moreThanOne())
                blockers = blockers.union(b);
        }
        const checkers = this.kingAttackers(king, opposite(this.turn), this.board.occupied);
        return {
            king,
            blockers,
            checkers,
            variantEnd,
            mustCapture: false,
        };
    }
    // The following should be identical in all subclasses
    clone() {
        var _a, _b;
        const pos = new this.constructor();
        pos.board = this.board.clone();
        pos.pockets = (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone();
        pos.turn = this.turn;
        pos.castles = this.castles.clone();
        pos.epSquare = this.epSquare;
        pos.remainingChecks = (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone();
        pos.halfmoves = this.halfmoves;
        pos.fullmoves = this.fullmoves;
        return pos;
    }
    equalsIgnoreMoves(other) {
        var _a, _b;
        return (this.rules === other.rules &&
            (this.pockets ? this.board.equals(other.board) : this.board.equalsIgnorePromoted(other.board)) &&
            ((other.pockets && ((_a = this.pockets) === null || _a === void 0 ? void 0 : _a.equals(other.pockets))) || (!this.pockets && !other.pockets)) &&
            this.turn === other.turn &&
            this.castles.unmovedRooks.equals(other.castles.unmovedRooks) &&
            this.legalEpSquare() === other.legalEpSquare() &&
            ((other.remainingChecks && ((_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.equals(other.remainingChecks))) ||
                (!this.remainingChecks && !other.remainingChecks)));
    }
    toSetup() {
        var _a, _b;
        return {
            board: this.board.clone(),
            pockets: (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
            turn: this.turn,
            unmovedRooks: this.castles.unmovedRooks,
            epSquare: this.legalEpSquare(),
            remainingChecks: (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone(),
            halfmoves: Math.min(this.halfmoves, 150),
            fullmoves: Math.min(Math.max(this.fullmoves, 1), 9999),
        };
    }
    isInsufficientMaterial() {
        return COLORS.every(color => this.hasInsufficientMaterial(color));
    }
    hasDests(ctx) {
        ctx = ctx || this.ctx();
        for (const square of this.board[this.turn]) {
            if (this.dests(square, ctx).nonEmpty())
                return true;
        }
        return this.dropDests(ctx).nonEmpty();
    }
    isLegal(move, ctx) {
        if (isDrop(move)) {
            if (!this.pockets || this.pockets[this.turn][move.role] <= 0)
                return false;
            if (move.role === 'pawn' && SquareSet.backranks().has(move.to))
                return false;
            return this.dropDests(ctx).has(move.to);
        }
        else {
            if (move.promotion === 'pawn')
                return false;
            if (move.promotion === 'king' && this.rules !== 'antichess')
                return false;
            if (!!move.promotion !== (this.board.pawn.has(move.from) && SquareSet.backranks().has(move.to)))
                return false;
            const dests = this.dests(move.from, ctx);
            return dests.has(move.to) || dests.has(this.normalizeMove(move).to);
        }
    }
    isCheck() {
        const king = this.board.kingOf(this.turn);
        return defined(king) && this.kingAttackers(king, opposite(this.turn), this.board.occupied).nonEmpty();
    }
    isEnd(ctx) {
        if (ctx ? ctx.variantEnd : this.isVariantEnd())
            return true;
        return this.isInsufficientMaterial() || !this.hasDests(ctx);
    }
    isCheckmate(ctx) {
        ctx = ctx || this.ctx();
        return !ctx.variantEnd && ctx.checkers.nonEmpty() && !this.hasDests(ctx);
    }
    isStalemate(ctx) {
        ctx = ctx || this.ctx();
        return !ctx.variantEnd && ctx.checkers.isEmpty() && !this.hasDests(ctx);
    }
    outcome(ctx) {
        const variantOutcome = this.variantOutcome(ctx);
        if (variantOutcome)
            return variantOutcome;
        ctx = ctx || this.ctx();
        if (this.isCheckmate(ctx))
            return { winner: opposite(this.turn) };
        else if (this.isInsufficientMaterial() || this.isStalemate(ctx))
            return { winner: undefined };
        else
            return;
    }
    allDests(ctx) {
        ctx = ctx || this.ctx();
        const d = new Map();
        if (ctx.variantEnd)
            return d;
        for (const square of this.board[this.turn]) {
            d.set(square, this.dests(square, ctx));
        }
        return d;
    }
    castlingSide(move) {
        if (isDrop(move))
            return;
        const delta = move.to - move.from;
        if (Math.abs(delta) !== 2 && !this.board[this.turn].has(move.to))
            return;
        if (!this.board.king.has(move.from))
            return;
        return delta > 0 ? 'h' : 'a';
    }
    normalizeMove(move) {
        const castlingSide = this.castlingSide(move);
        if (!castlingSide)
            return move;
        const rookFrom = this.castles.rook[this.turn][castlingSide];
        return {
            from: move.from,
            to: defined(rookFrom) ? rookFrom : move.to,
        };
    }
    play(move) {
        const turn = this.turn;
        const epSquare = this.epSquare;
        const castlingSide = this.castlingSide(move);
        this.epSquare = undefined;
        this.halfmoves += 1;
        if (turn === 'black')
            this.fullmoves += 1;
        this.turn = opposite(turn);
        if (isDrop(move)) {
            this.board.set(move.to, { role: move.role, color: turn });
            if (this.pockets)
                this.pockets[turn][move.role]--;
            if (move.role === 'pawn')
                this.halfmoves = 0;
        }
        else {
            const piece = this.board.take(move.from);
            if (!piece)
                return;
            let epCapture;
            if (piece.role === 'pawn') {
                this.halfmoves = 0;
                if (move.to === epSquare) {
                    epCapture = this.board.take(move.to + (turn === 'white' ? -8 : 8));
                }
                const delta = move.from - move.to;
                if (Math.abs(delta) === 16 && 8 <= move.from && move.from <= 55) {
                    this.epSquare = (move.from + move.to) >> 1;
                }
                if (move.promotion) {
                    piece.role = move.promotion;
                    piece.promoted = true;
                }
            }
            else if (piece.role === 'rook') {
                this.castles.discardRook(move.from);
            }
            else if (piece.role === 'king') {
                if (castlingSide) {
                    const rookFrom = this.castles.rook[turn][castlingSide];
                    if (defined(rookFrom)) {
                        const rook = this.board.take(rookFrom);
                        this.board.set(kingCastlesTo(turn, castlingSide), piece);
                        if (rook)
                            this.board.set(rookCastlesTo(turn, castlingSide), rook);
                    }
                }
                this.castles.discardSide(turn);
                if (castlingSide)
                    return;
            }
            const capture = this.board.set(move.to, piece) || epCapture;
            if (capture)
                this.playCaptureAt(move.to, capture);
        }
    }
    legalEpSquare(ctx) {
        if (!defined(this.epSquare))
            return;
        ctx = ctx || this.ctx();
        const ourPawns = this.board.pieces(this.turn, 'pawn');
        const candidates = ourPawns.intersect(pawnAttacks(opposite(this.turn), this.epSquare));
        for (const candidate of candidates) {
            if (this.dests(candidate, ctx).has(this.epSquare))
                return this.epSquare;
        }
        return;
    }
}
class Chess extends Position {
    constructor(rules) {
        super(rules || 'chess');
    }
    static default() {
        const pos = new this();
        pos.board = Board.default();
        pos.pockets = undefined;
        pos.turn = 'white';
        pos.castles = Castles.default();
        pos.epSquare = undefined;
        pos.remainingChecks = undefined;
        pos.halfmoves = 0;
        pos.fullmoves = 1;
        return pos;
    }
    static fromSetup(setup) {
        const pos = new this();
        pos.board = setup.board.clone();
        pos.pockets = undefined;
        pos.turn = setup.turn;
        pos.castles = Castles.fromSetup(setup);
        pos.epSquare = pos.validEpSquare(setup.epSquare);
        pos.remainingChecks = undefined;
        pos.halfmoves = setup.halfmoves;
        pos.fullmoves = setup.fullmoves;
        return pos.validate().map(_ => pos);
    }
    clone() {
        return super.clone();
    }
    validate() {
        if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
        if (this.board.king.size() !== 2)
            return n.err(new PositionError(IllegalSetup.Kings));
        if (!defined(this.board.kingOf(this.turn)))
            return n.err(new PositionError(IllegalSetup.Kings));
        const otherKing = this.board.kingOf(opposite(this.turn));
        if (!defined(otherKing))
            return n.err(new PositionError(IllegalSetup.Kings));
        if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty())
            return n.err(new PositionError(IllegalSetup.OppositeCheck));
        if (SquareSet.backranks().intersects(this.board.pawn))
            return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
        return this.validateCheckers();
    }
    validateCheckers() {
        const ourKing = this.board.kingOf(this.turn);
        if (defined(ourKing)) {
            // Multiple sliding checkers aligned with king.
            const checkers = this.kingAttackers(ourKing, opposite(this.turn), this.board.occupied);
            if (checkers.size() > 2 || (checkers.size() === 2 && ray(checkers.first(), checkers.last()).has(ourKing)))
                return n.err(new PositionError(IllegalSetup.ImpossibleCheck));
            // En passant square aligned with checker and king.
            if (defined(this.epSquare)) {
                for (const checker of checkers) {
                    if (ray(checker, this.epSquare).has(ourKing))
                        return n.err(new PositionError(IllegalSetup.ImpossibleCheck));
                }
            }
        }
        return n.ok(undefined);
    }
    validEpSquare(square) {
        if (!defined(square))
            return;
        const epRank = this.turn === 'white' ? 5 : 2;
        const forward = this.turn === 'white' ? 8 : -8;
        if (squareRank(square) !== epRank)
            return;
        if (this.board.occupied.has(square + forward))
            return;
        const pawn = square - forward;
        if (!this.board.pawn.has(pawn) || !this.board[opposite(this.turn)].has(pawn))
            return;
        return square;
    }
    castlingDest(side, ctx) {
        if (!defined(ctx.king) || ctx.checkers.nonEmpty())
            return SquareSet.empty();
        const rook = this.castles.rook[this.turn][side];
        if (!defined(rook))
            return SquareSet.empty();
        if (this.castles.path[this.turn][side].intersects(this.board.occupied))
            return SquareSet.empty();
        const kingTo = kingCastlesTo(this.turn, side);
        const kingPath = between(ctx.king, kingTo);
        const occ = this.board.occupied.without(ctx.king);
        for (const sq of kingPath) {
            if (this.kingAttackers(sq, opposite(this.turn), occ).nonEmpty())
                return SquareSet.empty();
        }
        const rookTo = rookCastlesTo(this.turn, side);
        const after = this.board.occupied.toggle(ctx.king).toggle(rook).toggle(rookTo);
        if (this.kingAttackers(kingTo, opposite(this.turn), after).nonEmpty())
            return SquareSet.empty();
        return SquareSet.fromSquare(rook);
    }
    canCaptureEp(pawn, ctx) {
        if (!defined(this.epSquare))
            return false;
        if (!pawnAttacks(this.turn, pawn).has(this.epSquare))
            return false;
        if (!defined(ctx.king))
            return true;
        const captured = this.epSquare + (this.turn === 'white' ? -8 : 8);
        const occupied = this.board.occupied.toggle(pawn).toggle(this.epSquare).toggle(captured);
        return !this.kingAttackers(ctx.king, opposite(this.turn), occupied).intersects(occupied);
    }
    pseudoDests(square, ctx) {
        if (ctx.variantEnd)
            return SquareSet.empty();
        const piece = this.board.get(square);
        if (!piece || piece.color !== this.turn)
            return SquareSet.empty();
        let pseudo = attacks(piece, square, this.board.occupied);
        if (piece.role === 'pawn') {
            let captureTargets = this.board[opposite(this.turn)];
            if (defined(this.epSquare))
                captureTargets = captureTargets.with(this.epSquare);
            pseudo = pseudo.intersect(captureTargets);
            const delta = this.turn === 'white' ? 8 : -8;
            const step = square + delta;
            if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
                pseudo = pseudo.with(step);
                const canDoubleStep = this.turn === 'white' ? square < 16 : square >= 64 - 16;
                const doubleStep = step + delta;
                if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
                    pseudo = pseudo.with(doubleStep);
                }
            }
            return pseudo;
        }
        else {
            pseudo = pseudo.diff(this.board[this.turn]);
        }
        if (square === ctx.king)
            return pseudo.union(this.castlingDest('a', ctx)).union(this.castlingDest('h', ctx));
        else
            return pseudo;
    }
    dests(square, ctx) {
        ctx = ctx || this.ctx();
        if (ctx.variantEnd)
            return SquareSet.empty();
        const piece = this.board.get(square);
        if (!piece || piece.color !== this.turn)
            return SquareSet.empty();
        let pseudo, legal;
        if (piece.role === 'pawn') {
            pseudo = pawnAttacks(this.turn, square).intersect(this.board[opposite(this.turn)]);
            const delta = this.turn === 'white' ? 8 : -8;
            const step = square + delta;
            if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
                pseudo = pseudo.with(step);
                const canDoubleStep = this.turn === 'white' ? square < 16 : square >= 64 - 16;
                const doubleStep = step + delta;
                if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
                    pseudo = pseudo.with(doubleStep);
                }
            }
            if (defined(this.epSquare) && this.canCaptureEp(square, ctx)) {
                const pawn = this.epSquare - delta;
                if (ctx.checkers.isEmpty() || ctx.checkers.singleSquare() === pawn) {
                    legal = SquareSet.fromSquare(this.epSquare);
                }
            }
        }
        else if (piece.role === 'bishop')
            pseudo = bishopAttacks(square, this.board.occupied);
        else if (piece.role === 'knight')
            pseudo = knightAttacks(square);
        else if (piece.role === 'rook')
            pseudo = rookAttacks(square, this.board.occupied);
        else if (piece.role === 'queen')
            pseudo = queenAttacks(square, this.board.occupied);
        else
            pseudo = kingAttacks(square);
        pseudo = pseudo.diff(this.board[this.turn]);
        if (defined(ctx.king)) {
            if (piece.role === 'king') {
                const occ = this.board.occupied.without(square);
                for (const to of pseudo) {
                    if (this.kingAttackers(to, opposite(this.turn), occ).nonEmpty())
                        pseudo = pseudo.without(to);
                }
                return pseudo.union(this.castlingDest('a', ctx)).union(this.castlingDest('h', ctx));
            }
            if (ctx.checkers.nonEmpty()) {
                const checker = ctx.checkers.singleSquare();
                if (!defined(checker))
                    return SquareSet.empty();
                pseudo = pseudo.intersect(between(checker, ctx.king).with(checker));
            }
            if (ctx.blockers.has(square))
                pseudo = pseudo.intersect(ray(square, ctx.king));
        }
        if (legal)
            pseudo = pseudo.union(legal);
        return pseudo;
    }
    isVariantEnd() {
        return false;
    }
    variantOutcome(_ctx) {
        return;
    }
    hasInsufficientMaterial(color) {
        if (this.board[color].intersect(this.board.pawn.union(this.board.rooksAndQueens())).nonEmpty())
            return false;
        if (this.board[color].intersects(this.board.knight)) {
            return (this.board[color].size() <= 2 &&
                this.board[opposite(color)].diff(this.board.king).diff(this.board.queen).isEmpty());
        }
        if (this.board[color].intersects(this.board.bishop)) {
            const sameColor = !this.board.bishop.intersects(SquareSet.darkSquares()) ||
                !this.board.bishop.intersects(SquareSet.lightSquares());
            return sameColor && this.board.pawn.isEmpty() && this.board.knight.isEmpty();
        }
        return true;
    }
}

function parseSan(pos, san) {
    const ctx = pos.ctx();
    // Castling
    let castlingSide;
    if (san === 'O-O' || san === 'O-O+' || san === 'O-O#')
        castlingSide = 'h';
    else if (san === 'O-O-O' || san === 'O-O-O+' || san === 'O-O-O#')
        castlingSide = 'a';
    if (castlingSide) {
        const rook = pos.castles.rook[pos.turn][castlingSide];
        if (!defined(ctx.king) || !defined(rook) || !pos.dests(ctx.king, ctx).has(rook))
            return;
        return {
            from: ctx.king,
            to: rook,
        };
    }
    // Normal move
    const match = san.match(/^([NBRQK])?([a-h])?([1-8])?[-x]?([a-h][1-8])(?:=?([nbrqkNBRQK]))?[+#]?$/);
    if (!match) {
        // Drop
        const match = san.match(/^([pnbrqkPNBRQK])?@([a-h][1-8])[+#]?$/);
        if (!match)
            return;
        const move = {
            role: charToRole(match[1]) || 'pawn',
            to: parseSquare(match[2]),
        };
        return pos.isLegal(move, ctx) ? move : undefined;
    }
    const role = charToRole(match[1]) || 'pawn';
    const to = parseSquare(match[4]);
    const promotion = charToRole(match[5]);
    if (!!promotion !== (role === 'pawn' && SquareSet.backranks().has(to)))
        return;
    if (promotion === 'king' && pos.rules !== 'antichess')
        return;
    let candidates = pos.board.pieces(pos.turn, role);
    if (match[2])
        candidates = candidates.intersect(SquareSet.fromFile(match[2].charCodeAt(0) - 'a'.charCodeAt(0)));
    if (match[3])
        candidates = candidates.intersect(SquareSet.fromRank(match[3].charCodeAt(0) - '1'.charCodeAt(0)));
    // Optimization: Reduce set of candidates
    const pawnAdvance = role === 'pawn' ? SquareSet.fromFile(squareFile(to)) : SquareSet.empty();
    candidates = candidates.intersect(pawnAdvance.union(attacks({ color: opposite(pos.turn), role }, to, pos.board.occupied)));
    // Check uniqueness and legality
    let from;
    for (const candidate of candidates) {
        if (pos.dests(candidate, ctx).has(to)) {
            if (defined(from))
                return; // Ambiguous
            from = candidate;
        }
    }
    if (!defined(from))
        return; // Illegal
    return {
        from,
        to,
        promotion,
    };
}

class MaterialSide {
    constructor() { }
    static empty() {
        const m = new MaterialSide();
        for (const role of ROLES)
            m[role] = 0;
        return m;
    }
    static fromBoard(board, color) {
        const m = new MaterialSide();
        for (const role of ROLES)
            m[role] = board.pieces(color, role).size();
        return m;
    }
    clone() {
        const m = new MaterialSide();
        for (const role of ROLES)
            m[role] = this[role];
        return m;
    }
    equals(other) {
        return ROLES.every(role => this[role] === other[role]);
    }
    add(other) {
        const m = new MaterialSide();
        for (const role of ROLES)
            m[role] = this[role] + other[role];
        return m;
    }
    nonEmpty() {
        return ROLES.some(role => this[role] > 0);
    }
    isEmpty() {
        return !this.nonEmpty();
    }
    hasPawns() {
        return this.pawn > 0;
    }
    hasNonPawns() {
        return this.knight > 0 || this.bishop > 0 || this.rook > 0 || this.queen > 0 || this.king > 0;
    }
    count() {
        return this.pawn + this.knight + this.bishop + this.rook + this.queen + this.king;
    }
}
class Material {
    constructor(white, black) {
        this.white = white;
        this.black = black;
    }
    static empty() {
        return new Material(MaterialSide.empty(), MaterialSide.empty());
    }
    static fromBoard(board) {
        return new Material(MaterialSide.fromBoard(board, 'white'), MaterialSide.fromBoard(board, 'black'));
    }
    clone() {
        return new Material(this.white.clone(), this.black.clone());
    }
    equals(other) {
        return this.white.equals(other.white) && this.black.equals(other.black);
    }
    add(other) {
        return new Material(this.white.add(other.white), this.black.add(other.black));
    }
    count() {
        return this.white.count() + this.black.count();
    }
    isEmpty() {
        return this.white.isEmpty() && this.black.isEmpty();
    }
    nonEmpty() {
        return !this.isEmpty();
    }
    hasPawns() {
        return this.white.hasPawns() || this.black.hasPawns();
    }
    hasNonPawns() {
        return this.white.hasNonPawns() || this.black.hasNonPawns();
    }
}
class RemainingChecks {
    constructor(white, black) {
        this.white = white;
        this.black = black;
    }
    static default() {
        return new RemainingChecks(3, 3);
    }
    clone() {
        return new RemainingChecks(this.white, this.black);
    }
    equals(other) {
        return this.white === other.white && this.black === other.black;
    }
}

var InvalidFen;
(function (InvalidFen) {
    InvalidFen["Fen"] = "ERR_FEN";
    InvalidFen["Board"] = "ERR_BOARD";
    InvalidFen["Pockets"] = "ERR_POCKETS";
    InvalidFen["Turn"] = "ERR_TURN";
    InvalidFen["Castling"] = "ERR_CASTLING";
    InvalidFen["EpSquare"] = "ERR_EP_SQUARE";
    InvalidFen["RemainingChecks"] = "ERR_REMAINING_CHECKS";
    InvalidFen["Halfmoves"] = "ERR_HALFMOVES";
    InvalidFen["Fullmoves"] = "ERR_FULLMOVES";
})(InvalidFen || (InvalidFen = {}));
class FenError extends Error {
}
function nthIndexOf(haystack, needle, n) {
    let index = haystack.indexOf(needle);
    while (n-- > 0) {
        if (index === -1)
            break;
        index = haystack.indexOf(needle, index + needle.length);
    }
    return index;
}
function parseSmallUint(str) {
    return /^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined;
}
function charToPiece(ch) {
    const role = charToRole(ch);
    return role && { role, color: ch.toLowerCase() === ch ? 'black' : 'white' };
}
function parseBoardFen(boardPart) {
    const board = Board.empty();
    let rank = 7;
    let file = 0;
    for (let i = 0; i < boardPart.length; i++) {
        const c = boardPart[i];
        if (c === '/' && file === 8) {
            file = 0;
            rank--;
        }
        else {
            const step = parseInt(c, 10);
            if (step > 0)
                file += step;
            else {
                if (file >= 8 || rank < 0)
                    return n.err(new FenError(InvalidFen.Board));
                const square = file + rank * 8;
                const piece = charToPiece(c);
                if (!piece)
                    return n.err(new FenError(InvalidFen.Board));
                if (boardPart[i + 1] === '~') {
                    piece.promoted = true;
                    i++;
                }
                board.set(square, piece);
                file++;
            }
        }
    }
    if (rank !== 0 || file !== 8)
        return n.err(new FenError(InvalidFen.Board));
    return n.ok(board);
}
function parsePockets(pocketPart) {
    if (pocketPart.length > 64)
        return n.err(new FenError(InvalidFen.Pockets));
    const pockets = Material.empty();
    for (const c of pocketPart) {
        const piece = charToPiece(c);
        if (!piece)
            return n.err(new FenError(InvalidFen.Pockets));
        pockets[piece.color][piece.role]++;
    }
    return n.ok(pockets);
}
function parseCastlingFen(board, castlingPart) {
    let unmovedRooks = SquareSet.empty();
    if (castlingPart === '-')
        return n.ok(unmovedRooks);
    if (!/^[KQABCDEFGH]{0,2}[kqabcdefgh]{0,2}$/.test(castlingPart)) {
        return n.err(new FenError(InvalidFen.Castling));
    }
    for (const c of castlingPart) {
        const lower = c.toLowerCase();
        const color = c === lower ? 'black' : 'white';
        const backrank = SquareSet.backrank(color).intersect(board[color]);
        let candidates;
        if (lower === 'q')
            candidates = backrank;
        else if (lower === 'k')
            candidates = backrank.reversed();
        else
            candidates = SquareSet.fromSquare(lower.charCodeAt(0) - 'a'.charCodeAt(0)).intersect(backrank);
        for (const square of candidates) {
            if (board.king.has(square) && !board.promoted.has(square))
                break;
            if (board.rook.has(square)) {
                unmovedRooks = unmovedRooks.with(square);
                break;
            }
        }
    }
    return n.ok(unmovedRooks);
}
function parseRemainingChecks(part) {
    const parts = part.split('+');
    if (parts.length === 3 && parts[0] === '') {
        const white = parseSmallUint(parts[1]);
        const black = parseSmallUint(parts[2]);
        if (!defined(white) || white > 3 || !defined(black) || black > 3)
            return n.err(new FenError(InvalidFen.RemainingChecks));
        return n.ok(new RemainingChecks(3 - white, 3 - black));
    }
    else if (parts.length === 2) {
        const white = parseSmallUint(parts[0]);
        const black = parseSmallUint(parts[1]);
        if (!defined(white) || white > 3 || !defined(black) || black > 3)
            return n.err(new FenError(InvalidFen.RemainingChecks));
        return n.ok(new RemainingChecks(white, black));
    }
    else
        return n.err(new FenError(InvalidFen.RemainingChecks));
}
function parseFen(fen) {
    const parts = fen.split(' ');
    const boardPart = parts.shift();
    // Board and pockets
    let board, pockets = n.ok(undefined);
    if (boardPart.endsWith(']')) {
        const pocketStart = boardPart.indexOf('[');
        if (pocketStart === -1)
            return n.err(new FenError(InvalidFen.Fen));
        board = parseBoardFen(boardPart.substr(0, pocketStart));
        pockets = parsePockets(boardPart.substr(pocketStart + 1, boardPart.length - 1 - pocketStart - 1));
    }
    else {
        const pocketStart = nthIndexOf(boardPart, '/', 7);
        if (pocketStart === -1)
            board = parseBoardFen(boardPart);
        else {
            board = parseBoardFen(boardPart.substr(0, pocketStart));
            pockets = parsePockets(boardPart.substr(pocketStart + 1));
        }
    }
    // Turn
    let turn;
    const turnPart = parts.shift();
    if (!defined(turnPart) || turnPart === 'w')
        turn = 'white';
    else if (turnPart === 'b')
        turn = 'black';
    else
        return n.err(new FenError(InvalidFen.Turn));
    return board.chain(board => {
        // Castling
        const castlingPart = parts.shift();
        const unmovedRooks = defined(castlingPart) ? parseCastlingFen(board, castlingPart) : n.ok(SquareSet.empty());
        // En passant square
        const epPart = parts.shift();
        let epSquare;
        if (defined(epPart) && epPart !== '-') {
            epSquare = parseSquare(epPart);
            if (!defined(epSquare))
                return n.err(new FenError(InvalidFen.EpSquare));
        }
        // Halfmoves or remaining checks
        let halfmovePart = parts.shift();
        let earlyRemainingChecks;
        if (defined(halfmovePart) && halfmovePart.includes('+')) {
            earlyRemainingChecks = parseRemainingChecks(halfmovePart);
            halfmovePart = parts.shift();
        }
        const halfmoves = defined(halfmovePart) ? parseSmallUint(halfmovePart) : 0;
        if (!defined(halfmoves))
            return n.err(new FenError(InvalidFen.Halfmoves));
        const fullmovesPart = parts.shift();
        const fullmoves = defined(fullmovesPart) ? parseSmallUint(fullmovesPart) : 1;
        if (!defined(fullmoves))
            return n.err(new FenError(InvalidFen.Fullmoves));
        const remainingChecksPart = parts.shift();
        let remainingChecks = n.ok(undefined);
        if (defined(remainingChecksPart)) {
            if (defined(earlyRemainingChecks))
                return n.err(new FenError(InvalidFen.RemainingChecks));
            remainingChecks = parseRemainingChecks(remainingChecksPart);
        }
        else if (defined(earlyRemainingChecks)) {
            remainingChecks = earlyRemainingChecks;
        }
        if (parts.length > 0)
            return n.err(new FenError(InvalidFen.Fen));
        return pockets.chain(pockets => unmovedRooks.chain(unmovedRooks => remainingChecks.map(remainingChecks => {
            return {
                board,
                pockets,
                turn,
                unmovedRooks,
                remainingChecks,
                epSquare,
                halfmoves,
                fullmoves: Math.max(1, fullmoves),
            };
        })));
    });
}
function makePiece(piece, opts) {
    let r = roleToChar(piece.role);
    if (piece.color === 'white')
        r = r.toUpperCase();
    if ((opts === null || opts === void 0 ? void 0 : opts.promoted) && piece.promoted)
        r += '~';
    return r;
}
function makeBoardFen(board, opts) {
    let fen = '';
    let empty = 0;
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = file + rank * 8;
            const piece = board.get(square);
            if (!piece)
                empty++;
            else {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                fen += makePiece(piece, opts);
            }
            if (file === 7) {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                if (rank !== 0)
                    fen += '/';
            }
        }
    }
    return fen;
}
function makePocket(material) {
    return ROLES.map(role => roleToChar(role).repeat(material[role])).join('');
}
function makePockets(pocket) {
    return makePocket(pocket.white).toUpperCase() + makePocket(pocket.black);
}
function makeCastlingFen(board, unmovedRooks, opts) {
    const shredder = opts === null || opts === void 0 ? void 0 : opts.shredder;
    let fen = '';
    for (const color of COLORS) {
        const backrank = SquareSet.backrank(color);
        const king = board.kingOf(color);
        if (!defined(king) || !backrank.has(king))
            continue;
        const candidates = board.pieces(color, 'rook').intersect(backrank);
        for (const rook of unmovedRooks.intersect(candidates).reversed()) {
            if (!shredder && rook === candidates.first() && rook < king) {
                fen += color === 'white' ? 'Q' : 'q';
            }
            else if (!shredder && rook === candidates.last() && king < rook) {
                fen += color === 'white' ? 'K' : 'k';
            }
            else {
                const file = FILE_NAMES[squareFile(rook)];
                fen += color === 'white' ? file.toUpperCase() : file;
            }
        }
    }
    return fen || '-';
}
function makeRemainingChecks(checks) {
    return `${checks.white}+${checks.black}`;
}
function makeFen(setup, opts) {
    return [
        makeBoardFen(setup.board, opts) + (setup.pockets ? `[${makePockets(setup.pockets)}]` : ''),
        setup.turn[0],
        makeCastlingFen(setup.board, setup.unmovedRooks, opts),
        defined(setup.epSquare) ? makeSquare(setup.epSquare) : '-',
        ...(setup.remainingChecks ? [makeRemainingChecks(setup.remainingChecks)] : []),
        ...((opts === null || opts === void 0 ? void 0 : opts.epd) ? [] : [Math.max(0, Math.min(setup.halfmoves, 9999)), Math.max(1, Math.min(setup.fullmoves, 9999))]),
    ].join(' ');
}

const HAS_GLOBAL = typeof global != "undefined";
const HAS_WINDOW = typeof window != "undefined";
const HAS_SELF = typeof self != "undefined";

const NODE = "NODE";
const BROWSER = "BROWSER";
const WORKER = "WORKER";

let FRAMEWORK = null;

if(HAS_GLOBAL) FRAMEWORK = NODE;
if(HAS_WINDOW) FRAMEWORK = BROWSER;
if(HAS_SELF) FRAMEWORK = WORKER;

function Framework() {
    return FRAMEWORK
}

let VERBOSE = false;

function Verbose() {
    VERBOSE = true;
}

function log(content) {
    if(VERBOSE){
        console.log(content);
    }
}

Verbose();

const framework = Framework();

log(framework);

// Pos_ is an abstraction of a chess position
class Pos_{
    constructor(){
        // initialize to standard chess starting position
        this.pos = new Chess();
    }

    setVariant(variant){
        this.pos = new Chess(variant);
        return this
    }

    setFen(fen){
        const variant = this.pos.rules;
        const setup = parseFen(fen).value;        
        this.pos = Chess.fromSetup(setup).value;    
        this.pos.rules = variant;
        return this
    }

    reportFen(){
        return makeFen(this.pos.toSetup())
    }

    sanToMove(san){
        return parseSan(this.pos, san)
    }

    play(move){
        this.pos.play(move);
        return this
    }

    playSan(san){
        return this.play(this.sanToMove(san))
    }

    toString(){
        return `[Pos ${this.pos.rules} ${this.reportFen()}]`
    }
}
function Pos(){
    return new Pos_()
}

const pos = Pos().setVariant("atomic").setFen("rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1");

pos.playSan("d5");

console.log(pos.reportFen());

exports.Pos = Pos;
exports.Pos_ = Pos_;
