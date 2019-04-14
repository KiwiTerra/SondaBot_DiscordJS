const Discord = require('discord.js');

module.exports = {
    name: 'color',
    type: 'dm',
    execute(member, message, poll, args) {
        if(!poll) return;
        const client = message.client;

        if(args.length < 1) {
            const colors = client.colors.map(color => color).join('|');
            return message.reply(`Utilisation: .color ${colors}`).then(msg => msg.delete(5000));
        }

        const colorArg = args[0].toUpperCase();

        if(!client.colors.find(color => color === colorArg)) {
            const colors = client.colors.map(color => color).join('|');
            return message.reply(`Couleur incorrecte ! Utilisation: .color ${colors}`);
        }

        message.channel.fetchMessage(poll.message).then(pollMessage => {

            const embed = pollMessage.embeds[0];
            const newEmbed = new Discord.RichEmbed(embed);

            newEmbed.setColor(colorArg);
            poll.color = colorArg;

            pollMessage.edit(newEmbed);
        });

    },
};