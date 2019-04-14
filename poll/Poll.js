const Discord = require('discord.js');
class Poll {

    constructor(member) {
        this.member = member.user.id;
        this.color = 'GREY';
        this.end = false;
        this.question = '';
        this.answers = [];
        this.emotes = [];
    }

    getDescription() {

        const optional = (condition, ...elements) => condition ? elements : [];
        const lines = this.answers.map((answer, index) => {
            const emote = this.emotes.length > index ? this.emotes[index] : Poll.EMOTES[index];
            return `${emote} ${answer}`;
        });

        const description = [
            ...optional(this.question.length > 255, `**${this.question}**`),
            ...lines,
        ].join('\n\n');

        return description;
    }

    cancel(channel, client) {
        channel.fetchMessage(this.message).then(pollMessage => {
            pollMessage.delete();
            client.deletePoll(this);
            channel.send('**Annulation**');
        });
    }
    async endPoll(user, channel, approved) {

        const embed = new Discord.RichEmbed()
            .setColor(this.color)
            .setTitle(this.question.length > 255 ? null : this.question)
            .setAuthor(user.username, user.avatarURL)
            .setFooter(user.id, user.avatarURL)
            .setDescription(this.getDescription());

        const result = await channel.send(embed);
        if(!approved) {
            await result.react('✅');
            await result.react('❎');
            return;
        }

        const reactions = this.emotes.reduce(async (count, emote) => {
            await result.react(emote);
            return ++count;
        }, 0);

        for(let i = reactions; i < this.answers.length; i++) {
            await result.react(Poll.EMOTES[i]);
        }
    }
}
Poll.EMOTES = ['\u0030\u20E3', '\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3',
            '\u0035\u20E3', '\u0036\u20E3', '\u0037\u20E3', '\u0038\u20E3', '\u0039\u20E3', '\uD83C\uDDE6',
            '\uD83C\uDDE7', '\uD83C\uDDE8', '\uD83C\uDDE9', '\uD83C\uDDEA', '\uD83C\uDDEB', '\uD83C\uDDEC',
            '\uD83C\uDDED', '\uD83C\uDDEE', '\uD83C\uDDEF'];

module.exports = Poll;