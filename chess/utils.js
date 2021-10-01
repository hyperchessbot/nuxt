export const HAS_GLOBAL = typeof global != "undefined"
export const HAS_WINDOW = typeof window != "undefined"
export const HAS_SELF = typeof self != "undefined"

export const NODE = "NODE"
export const BROWSER = "BROWSER"
export const WORKER = "WORKER"

let FRAMEWORK = null

if(HAS_GLOBAL) FRAMEWORK = NODE
if(HAS_WINDOW) FRAMEWORK = BROWSER
if(HAS_SELF) FRAMEWORK = WORKER

export function Framework() {
    return FRAMEWORK
}

let VERBOSE = false

export function Verbose() {
    VERBOSE = true
}

export function log(content) {
    if(VERBOSE){
        console.log(content)
    }
}