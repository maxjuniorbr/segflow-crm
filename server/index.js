import app from './src/app.js';
import { isTest, jwtSecret, port } from './src/config/env.js';

if (!isTest) {
    if (!jwtSecret) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        process.exit(1);
    }
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
