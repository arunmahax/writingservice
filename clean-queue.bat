@echo off
echo ========================================
echo  Cleaning Redis Queue
echo ========================================
echo.
echo Removing all pending jobs...
echo.

cd /d "%~dp0"

node -e "const { Queue } = require('bullmq'); const queue = new Queue('recipe-generation', { connection: { host: 'localhost', port: 6379 } }); queue.obliterate({ force: true }).then(() => { console.log('✅ Queue cleaned!'); process.exit(0); });"

echo.
echo Done! Queue is now empty.
pause
