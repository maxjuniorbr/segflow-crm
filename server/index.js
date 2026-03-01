import app from './src/app.js';
import pool from './config/db.js';
import { isTest, jwtSecret, port } from './src/config/env.js';
import { deleteExpiredRefreshTokens } from './src/infrastructure/repositories/refreshTokenRepository.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

if (!isTest) {
    if (!jwtSecret || jwtSecret.length < 32) {
        console.error('FATAL ERROR: JWT_SECRET must be defined and at least 32 characters.');
        process.exit(1);
    }

    const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
    const cleanupTimer = setInterval(async () => {
        try {
            const count = await deleteExpiredRefreshTokens();
            if (count > 0) console.log(`Cleaned up ${count} expired/revoked refresh tokens`);
        } catch (err) {
            console.error('Token cleanup failed:', err.message);
        }
    }, CLEANUP_INTERVAL_MS);
    cleanupTimer.unref();

    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

    let isShuttingDown = false;
    const shutdown = (signal) => {
        if (isShuttingDown) return;
        isShuttingDown = true;
        console.log(`${signal} received. Shutting down gracefully...`);

        const forceExit = setTimeout(() => {
            console.error('Shutdown timed out, forcing exit.');
            process.exit(1);
        }, SHUTDOWN_TIMEOUT_MS);
        forceExit.unref();

        server.close(async () => {
            try {
                await pool.end();
                console.log('Database pool closed.');
            } catch (err) {
                console.error('Error closing database pool:', err);
            }
            console.log('Server closed.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled Rejection:', reason);
        shutdown('unhandledRejection');
    });
}
