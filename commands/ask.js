const Discord = require('discord.js');

module.exports = {
    name: 'ask',
    type: 'dm',
    execute(member, message, poll, args) {
        if(!poll) return;

        const question = args.join(' ');
        poll.question = question;

        message.channel.fetchMessage(poll.message).then(pollMessage => {
            const embed = pollMessage.embeds[0];
            const newEmbed = new Discord.RichEmbed(embed)
                                .setTitle(question.length > 255 ? undefined : question)
                                .setDescription(poll.getDescription());

            pollMessage.edit(newEmbed);
        });
    },
};