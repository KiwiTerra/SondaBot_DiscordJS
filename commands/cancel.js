module.exports = {
    name: 'cancel',
    type: 'dm',
    execute(member, message, poll, args) {
        if(!poll) return;
        poll.cancel(message.channel, message.client);
    },
};