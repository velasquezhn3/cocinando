// logger.ts
// Logger mejorado para el bot WhatsApp
// Permite registrar mensajes en consola y archivos, con distintos niveles y colores

import * as fs from 'fs';
import * as path from 'path';

export class Logger {
    private logDir: string;
    private logLevel: string;
    private colors = {
        reset: "\x1b[0m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m"
    };

    constructor(logLevel: string = "info") {
        this.logLevel = logLevel;
        this.logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    // Devuelve la fecha y hora actual en formato legible
    private getTimestamp(): string {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    // Escribe el log en un archivo diario
    private writeToFile(level: string, message: string, ...args: any[]): void {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            args: args.length > 0 ? args : undefined
        };
        const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
    }

    // Determina si el nivel de log debe mostrarse según la configuración
    private shouldLog(level: string): boolean {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }

    // Log de depuración
    debug(message: string, ...args: any[]): void {
        if (this.shouldLog('debug')) {
            console.log(`${this.colors.gray}[DEBUG] ${this.getTimestamp()} ${message}${this.colors.reset}`, ...args);
            this.writeToFile('DEBUG', message, ...args);
        }
    }

    // Log informativo
    info(message: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.log(`${this.colors.green}[INFO] ${this.getTimestamp()} ${message}${this.colors.reset}`, ...args);
            this.writeToFile('INFO', message, ...args);
        }
    }

    // Log de advertencia
    warn(message: string, ...args: any[]): void {
        if (this.shouldLog('warn')) {
            console.log(`${this.colors.yellow}[WARN] ${this.getTimestamp()} ${message}${this.colors.reset}`, ...args);
            this.writeToFile('WARN', message, ...args);
        }
    }

    // Log de error
    error(message: string, ...args: any[]): void {
        if (this.shouldLog('error')) {
            console.log(`${this.colors.red}[ERROR] ${this.getTimestamp()} ${message}${this.colors.reset}`, ...args);
            this.writeToFile('ERROR', message, ...args);
        }
    }

    // Log de éxito
    success(message: string, ...args: any[]): void {
        console.log(`${this.colors.green}[SUCCESS] ${this.getTimestamp()} ${message}${this.colors.reset}`, ...args);
        this.writeToFile('SUCCESS', message, ...args);
    }
}