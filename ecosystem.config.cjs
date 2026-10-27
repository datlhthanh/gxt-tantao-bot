module.exports = {
  apps: [
    {
      name: "gxt-tantao-bot",
      script: "src/index.js",
      autorestart: true,
      max_memory_restart: "300M",
    },
  ],
};
