export const logLevels = ["debug", "log", "warn", "error", "none"] as const;
type LogLevel = (typeof logLevels)[number];

declare global {
    var logLevel: LogLevel;
}

export function LoggingConfig() {

    return {
        configure: () => {
            const shouldLog = (level: LogLevel) => {
                return logLevels.indexOf(level) >= logLevels.indexOf(global.logLevel);
            };

            global.logLevel = "log";

            const _console = console
            global.console = {
                ...global.console,
                log: (message?: any, ...optionalParams: any[]) => {
                    shouldLog("log") && _console.log(message, ...optionalParams);
                },
                warn: (message?: any, ...optionalParams: any[]) => {
                    shouldLog("warn") && _console.warn(message, ...optionalParams);
                },
                error: (message?: any, ...optionalParams: any[]) => {
                    shouldLog("error") && _console.error(message, ...optionalParams);
                },
                debug: (message?: any, ...optionalParams: any[]) => {
                    shouldLog("debug") && _console.debug(message, ...optionalParams);
                },
            };
        }
    }

}