const Poll = require('../poll/Poll.js');
const Discord = require('discord.js');

module.exports = {
    name: 'poll',
    type: 'text',
    execute(member, message, poll, args) {
        if(!(member.roles.some(role => role.name === 'Sondeur')) && !member.hasPermission('ADMINISTRATOR')) {
            message.reply('Tu n\'as pas la permission').then(msg => msg.delete(5000));
            return;
        }

        const channel = message.channel;
        const text = channel.name !== 'commandes' ? 'Vous devez être dans le salon #commandes pour faire ceci !' : 'Regardez vos messages privés';
        message.reply(text).then(msg => {
            msg.delete(5000);
            message.delete(5000);
        });

        if(channel.name !== 'commandes') {
            return;
        }

        const user = member.user;
        const client = member.client;
        if(poll) client.deletePoll(poll);

        const newPoll = new Poll(member);
        client.addPoll(newPoll);

        const embed = new Discord.RichEmbed()
        .setAuthor(user.username, user.avatarURL)
        .setFooter(user.id, user.avatarURL)
        .setColor(newPoll.color);

        user.createDM().then(privateChannel => {
            privateChannel.send(embed).then(msg => newPoll.message = msg.id);

            const colors = client.colors.map(color => color).join('|');

            privateChannel.send(`**Changer la couleur:** \`\`.color ${colors}\`\` \n`
            + '**Changer la question:** ``.ask <question>`` \n'
            + '**Ajouter un choix:** ``.add <choix>`` \n'
            + '**Ajouter une réaction:** ``.react :emote:`` \n'
            + '**Terminer le sondage:** ``.end`` (2 choix minimums) \n'
            + '**Annuler le sondage:** ``.cancel``');
        }).catch(error => { if(error) message.reply('Impossible de vous envoyer un message, vos MP sont désactivés !'); });

    },
};