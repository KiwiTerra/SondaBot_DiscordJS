const Discord = require('discord.js');

module.exports = [
    {
        name: 'messageReactionAdd',
        execute(reaction, user) {
            if(user.bot) return;
            const message = reaction.message;
            const channel = message.channel;
            const client = message.client;

            if(channel.type === 'dm') {
                const poll = client.getPollByUser(user);
                if(!poll || !poll.end) return;

                const emote = reaction.emoji.name;

                if(emote === '✅') {
                    const member = client.guild.member(user);
                    const approved = member.roles.some(role => role.name === 'Pilier de la Commu');
                    poll.endPoll(user, approved ? client.pollChannel : client.pollVerifyChannel, approved);
                    message.delete();
                    channel.send(`Le sondage a été envoyé${approved ? ' en validation' : ''} !`);

                } else if(emote === '❎') {
                    poll.cancel(channel, client);
                    message.delete();
                }
                return;
            }

            if(message.embeds.length < 1) return;
            const embed = message.embeds[0];

            const member = client.guild.member(user);
            if(!member.hasPermission('ADMINISTRATOR') && user.tag !== 'Nolan#6423') return;

            const userId = embed.footer.text;
            const memberPoll = client.guild.member(userId);

            const emote = reaction.emoji.name;

            let accepted = false;

            if(emote === '✅') {

                const newEmbed = new Discord.RichEmbed(embed)
                .setFooter(memberPoll.user.username, memberPoll.user.avatarURL)
                .setAuthor('');
                client.pollChannel.send(newEmbed).then(result => {
                    const choices = newEmbed.description.split('\n');
                    addReactions(result, choices);
                });

                accepted = true;
            }

            message.clearReactions();

            memberPoll.user.createDM().then(privateChannel => {
                privateChannel.send(`**Votre sondage du ${message.createdAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} a été ${accepted ? 'accepté' : 'refusé'}**`);
            });

            channel.send(`= ${memberPoll.user.tag} = \n`+
            `Date :: ${message.createdAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} \n`+
            `Par  :: ${user.tag} \n`+
            `Etat :: ${accepted ? 'Accepté' : 'Refusé'} \n`, { code: 'asciidoc' });
        },
    },
    {
        name: 'messageReactionAdd',
        execute(reaction, user) {
            const message = reaction.message;
            const channel = message.channel;
            const client = message.client;
            if(channel.type === 'dm' || channel !== client.pollVerifyChannel || user.bot) return;

        },
    },
];

async function addReactions(result, choices) {
    for(const choice of choices) {
        const cuts = choice.split(' ');
        if(cuts.length >= 1 && cuts[0].length > 0) {
            await result.react(cuts[0]);
        }
    }
}