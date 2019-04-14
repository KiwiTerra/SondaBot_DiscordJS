module.exports = {
    name: 'end',
    type: 'dm',
    execute(member, message, poll, args) {
        if(!poll) return;
        if(poll.answers.length >= 2 && poll.question.length > 0) {
            poll.end = true;
            poll.endPoll(member, message.channel, false);
        }
    },
};