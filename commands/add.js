const Discord = require('discord.js');

module.exports = {
    name: 'add',
    type: 'dm',
    execute(member, message, poll, args) {
        if(!poll) return;

        const answers = poll.answers;

        if(answers.length >= 20) {
            return message.reply('La limite de réponses est atteinte !').then(msg => msg.delete(5000));
        }

        const answer = args.join(' ');
        if(answer.length === 0) return message.reply('Un choix ne peut pas être vide !').then(msg => msg.delete(5000));
        answers.push(answer);

        message.channel.fetchMessage(poll.message).then(pollMessage => {
            const embed = pollMessage.embeds[0];
            const newEmbed = new Discord.RichEmbed(embed).setDescription(poll.getDescription());
            pollMessage.edit(newEmbed);
        });
    },
};