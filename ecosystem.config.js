module.exports = {
  apps: [
    {
      name: 'recipe-api',
      script: './src/server.v2.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3090
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    },
    {
      name: 'recipe-worker',
      script: './src/workers/recipeWorker.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    }
  ]
};
