// PM2 config for NHTSA pipeline on VPS
// Add these entries to /opt/dashpicked/ecosystem.config.js (or run standalone)
module.exports = {
  apps: [
    {
      name: "nhtsa-pipeline",
      script: "/usr/bin/node",
      args: "pipeline/fetch-nhtsa.js",
      cwd: "/opt/recallscanner",
      cron_restart: "0 3 * * *", // Daily at 3:00 UTC
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
      out_file: "/opt/recallscanner/logs/pipeline-out.log",
      error_file: "/opt/recallscanner/logs/pipeline-error.log",
      log_file: "/opt/recallscanner/logs/pipeline.log",
      merge_logs: true,
    },
  ],
};
