# npm-hook-discord

An example Discord integration that listen to registry hook events on an [npm-hook-receiver](https://github.com/npm/npm-hook-receiver) and posts about them in a Discord channel. This has been adapted/inspired from [npm-hook-slack](https://github.com/npm/npm-hook-slack).

A config file is available in `src/config.json` where you can set variables instead of using environment variables.

To run the integration, set the required environment or config variables then run the index file:

```
npm start
```

All configuration is done with environment variables or through the `src/config.json`. These are the vars used:

| variable | meaning | required? | default |
| --- | --- | --- | --- |
| WEBHOOK_URL | the webhook url you generated in Discord | y | - |
| SHARED_SECRET | the shared secret set up for the hooks you'll be receiving | y | - |
| PORT | the port number to listen on | n | 3000 |
| MOUNT_POINT | the path to mount the hook on | n | `/incoming` |
| SERVICE_NAME | used in logging | n | `my-service` |


To setup an npm hook you can use [wombat](https://www.npmjs.com/package/wombat), like so:

```
wombat hook add my-npm-package http://my-website:my-port/incoming my-shared-secret
```

## License

ISC