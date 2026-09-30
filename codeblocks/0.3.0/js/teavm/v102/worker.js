Error.stackTraceLimit = 50

let currentCompileRequestId = 'prep'

function normalizeCompilerMessage(value) {
    const rawText =
        (value && typeof value === 'object' && (value.stack || value.message)) ||
        (typeof value === 'string' ? value : '') ||
        'Internal compiler error'

    const lines = rawText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

    let headline = lines.length > 0 ? lines[0] : 'Internal compiler error'
    headline = headline.replace(/^Uncaught\s+/, '')

    const runtimeErrorMatch = /^RuntimeError:\s*(.+)$/i.exec(headline)
    if (runtimeErrorMatch && runtimeErrorMatch[1]) {
        headline = runtimeErrorMatch[1].trim()
    }

    if (!headline || /^at\s+/i.test(headline) || /^https?:\/\//i.test(headline)) {
        headline = 'Internal compiler error'
    }

    return {
        rawText,
        userText: headline,
    }
}

function extractLocationFromStack(value) {
    const stackText =
        (value && typeof value === 'object' && (value.stack || value.message)) ||
        (typeof value === 'string' ? value : '')
    if (!stackText) {
        return { fileName: null, lineNumber: 0, columnNumber: 1 }
    }

    const frameRegex = /\bat\s+([^\s:]+\.java):(\d+)(?::(\d+))?/g
    let match
    while ((match = frameRegex.exec(stackText)) !== null) {
        return {
            fileName: match[1],
            lineNumber: Number.parseInt(match[2], 10) || 0,
            columnNumber: Number.parseInt(match[3] || '1', 10) || 1,
        }
    }

    return { fileName: null, lineNumber: 0, columnNumber: 1 }
}

function postCompilerFailure(message, id = currentCompileRequestId) {
    const normalized = normalizeCompilerMessage(message)
    const text = normalized.userText
    const requestId = id != null ? '' + id : 'prep'
    const location = extractLocationFromStack(normalized.rawText)
    console.error('[TeaVM compiler worker internal error]', normalized.rawText)
    self.postMessage({
        command: 'compiler-diagnostic',
        id: requestId,
        severity: 'ERROR',
        text,
        humanReadable: text,
        fileName: location.fileName,
        lineNumber: location.lineNumber,
        columnNumber: location.columnNumber,
        internalText: normalized.rawText,
        requiresRestart: true,
    })
    self.postMessage({
        command: 'compilation-complete',
        id: requestId,
        status: 'errors',
        requiresRestart: true,
    })
}

self.addEventListener('message', (event) => {
    const data = event && event.data
    if (data && data.command === 'compile' && data.id != null) {
        currentCompileRequestId = '' + data.id
    }
})

self.addEventListener('error', (event) => {
    const err = event && event.error
    const message =
        (err && (err.stack || err.message)) ||
        (event && event.message) ||
        'Internal compiler error'
    postCompilerFailure(message)
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault()
    }
})

self.addEventListener('unhandledrejection', (event) => {
    const reason = event && event.reason
    const message =
        (reason && (reason.stack || reason.message)) ||
        (typeof reason === 'string' ? reason : null) ||
        'Unhandled compiler promise rejection'
    postCompilerFailure(message)
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault()
    }
})

;(async function () {
    try {
        let teavmSupport = await import('./worker/compiler.wasm-runtime.js')
        let teavm = await teavmSupport.load('worker/compiler.wasm', {
            stackDeobfuscator: {
                enabled: true,
            },
        })

        teavm.exports.installWorker()
    } catch (e) {
        postCompilerFailure((e && (e.stack || e.message)) || 'Compiler worker bootstrap failed')
    }
})()
