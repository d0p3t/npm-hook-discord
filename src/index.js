const assert = require('assert');
const bole = require('bole');
const config = require('./config.json');
const discord = require('webhook-discord');
const logstring = require('common-log-string');
const makeReceiver = require('npm-hook-receiver');

const logger = bole(process.env.SERVICE_NAME || 'hooks-bot');
bole.output({ level: 'info', stream: process.stdout });

const port = process.env.PORT || config.PORT || '3000';

const token = process.env.WEBHOOK_URL || config.DISCORD.WEBHOOK_URL || '';
assert(token, 'You must supply a Discord Webhook URL in the config');

const Hook = new discord.Webhook(config.DISCORD.WEBHOOK_URL);

const opts = {
  name: process.env.SERVICE_NAME || config.NPM.SERVICE_NAME || 'my-service',
  secret: process.env.SHARED_SECRET || config.NPM.SHARED_SECRET || '',
  mount: process.env.MOUNT_POINT || config.NPM.MOUNT_POINT || '/incoming'
};
const server = makeReceiver(opts);

server.on('hook', function inComingHook(hook) {
  const pkg = hook.name.replace('/', '%2F');
  const type = hook.type;
  const change = hook.event.replace(`${type}:`, '');

  let message = '';
  let title = '';
  console.log(hook.change);
  const user = hook.change ? hook.change.user : '';
  switch (hook.event) {
    case 'package:star':
      message = `★ \<https://www.npmjs.com/~${user}|${user}\> starred :package: \<https://www.npmjs.com/package/${pkg}|${
        hook.name
      }\>`;
      break;

    case 'package:unstar':
      message = `✩ \<https://www.npmjs.com/~${user}|${user}\> unstarred :package: \<https://www.npmjs.com/package/${pkg}|${
        hook.name
      }\>`;
      break;

    case 'package:publish':
      message = `:package: \<https://www.npmjs.com/package/${pkg}|${
        hook.name
      }\>@${hook.change.version} published!`;
      title = 'Version Update!';
      break;

    case 'package:unpublish':
      message = `:package: \<https://www.npmjs.com/package/${pkg}|${
        hook.name
      }\>@${hook.change.version} unpublished`;
      title = 'Critical Version Change';
      break;

    case 'package:dist-tag':
      message = `:package: \<https://www.npmjs.com/package/${pkg}|${
        hook.name
      }\>@${hook.change.version} new dist-tag: \`${hook.change['dist-tag']}\``;
      break;

    case 'package:dist-tag-rm':
      message = `:package: \<https://www.npmjs.com/package/${pkg}|${
        hook.name
      }\>@${hook.change.version} dist-tag removed: \`${
        hook.change['dist-tag']
      }\``;
      break;

    case 'package:owner':
      message = `:package: \<https://www.npmjs.com/package/${pkg}|${
        hook.name
      }\> owner added: \`${hook.change.user}\``;

      break;

    case 'package:owner-rm':
      message = `:package: \<https://www.npmjs.com/package/${pkg}|${
        hook.name
      }\> owner removed: \`${hook.change.user}\``;
      break;

    case 'package:deprecated':
      message = `:package: \<https://www.npmjs.com/package/${pkg}|${
        hook.name
      }\>@${hook.change.deprecated} is now deprecated`;
      title = 'Critical Version Change';
      break;
    default:
      console.log(`Unhandled change detected. ${change}`);
  }

  if (message === '') {
    return;
  }

  const msg = new discord.MessageBuilder()
    .setName('npm Update')
    .setColor('#CC3534')
    .setText('')
    .addField(title, message)
    .setTime();
  Hook.send(msg);
});

server.on('hook:error', function(message) {
  Hook.err('Error Handling Webhook', message);
});

server.on('after', function logEachRequest(request, response, route, error) {
  logger.info(logstring(request, response));
});

server.listen(port, function() {
  logger.info('listening on ' + port);
});
