module.exports = {
    name: 'stop',
    type: 'dm',
    execute(user, message, poll, args) {
        const client = message.client;
        const member = client.guild.member(user);
        if(!member.hasPermission('ADMINISTRATOR') && user.tag !== 'Nolan#6423') return;

        client.destroy().then(() => {
            process.exit(0);
            client.logger.log('info', `Stop bot in progress.. (Ask by ${user.tag})`);
        }).catch(() => client.logger.log('error', `Error while stopping the bot (Ask by ${user.tag})`));
    },
};