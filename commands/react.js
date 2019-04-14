const Discord = require('discord.js');
module.exports = {
    name: 'react',
    type: 'dm',
    execute(member, message, poll, args) {
        if(!poll) return;

        if(args.length < 0) {
            return message.reply('Utilisation: .react :emote:').then(msg => msg.delete(5000));
        }

        message.channel.fetchMessage(poll.message).then(pollMessage => {

            const emotes = poll.emotes;
            if(emotes.length + 1 > poll.answers.length) {
                return message.reply('Les réactions sont déjà attribués aux choix que vous avez donné.').then(msg => msg.delete(5000));
            }

            const emoji = args[0];
            pollMessage.react(emoji).then(() => {

                emotes.push(emoji);

                const embed = pollMessage.embeds[0];
                const newEmbed = new Discord.RichEmbed(embed).setDescription(poll.getDescription());
                pollMessage.edit(newEmbed);
            }).catch(error => {
                if(error) {
                    message.reply('Emoji incorrect ! Utilisation: .react :emote:').then(msg => msg.delete(5000));
                }
            });


        });

    },
};