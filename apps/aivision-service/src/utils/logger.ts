import { createLogger, format, transports } from 'winston';
import { config } from '../config';

export const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        config.nodeEnv === 'production'
            ? format.json()
            : format.combine(format.colorize(), format.simple())
    ),
    defaultMeta: { service: 'ai-vision' },
    transports: [new transports.Console()],
});
