const fs = require('fs');
const Discord = require('discord.js');
const winston = require('winston');
const config = require('./config.json');
const { prefix, token, guildID, pollChannelID, pollVerifyChannelID } = config;

const client = new Discord.Client();
client.commands = new Discord.Collection();

const logger = winston.createLogger({
    transports: [
		new winston.transports.Console(),
	],
	format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

client.logger = logger;

client.once('ready', () => {
    verifyConfig();
    initCommands();
    initEvents();

    // Setting up the bot's presence

    client.user.setPresence({
        game: {
            name: '.poll - V2.0',
            type: 'WATCHING',
        },
        status: 'online',
    });

    // Setting up poll's variables

    client.polls = [];
    client.getPollByUser = user => client.polls.find(poll => poll.member === user.id);
    client.deletePoll = poll => client.polls = client.polls.filter(element => poll !== element);
    client.addPoll = poll => client.polls.push(poll);

    logger.log('info', 'The bot is online !');
});

client.on('debug', m => logger.log('debug', m));
client.on('warn', m => logger.log('warn', m));
client.on('error', m => logger.log('error', m));
process.on('uncaughtException', error => logger.log('error', error));

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    if(message.channel.type === 'text' && message.guild.id !== guildID) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
    const member = message.member;
    const channel = message.channel;
    const poll = client.getPollByUser(message.author);

    const command = client.commands.get(commandName);
    if(!command || (channel.type !== command.type)) return;
	command.execute(member ? member : message.author, message, poll, args);
});

client.on('raw', packet => {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    const channel = client.channels.get(packet.d.channel_id);
    if (channel.messages.has(packet.d.message_id)) return;
    channel.fetchMessage(packet.d.message_id).then(message => {
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        const reaction = message.reactions.get(emoji);
        if (reaction) reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
        client.emit(packet.t === 'MESSAGE_REACTION_ADD' ? 'messageReactionAdd' : 'messageReactionRemove', reaction, client.users.get(packet.d.user_id));
    });
});

client.login(token);

function verifyConfig() {
    if(!config.hasOwnProperty('guildID') || !config.hasOwnProperty('pollChannelID') || !config.hasOwnProperty('pollVerifyChannelID')) {
        const property = !config.hasOwnProperty('guildID') ? 'guild' : (!config.hasOwnProperty('pollChannelID') ? '#sondages' : '#sondages-verif');
        logger.log('error', `Id of the ${property} must be defined !`);
        client.destroy();
        return;
    }

    const guild = client.guilds.get(guildID);
    if(!guild) {
        logger.log('error', 'Guild cannot be found !');
        client.destroy();
        return;
    }

    const pollChannel = guild.channels.get(pollChannelID);
    const pollVerifyChannel = guild.channels.get(pollVerifyChannelID);
    if(!pollChannel || !pollVerifyChannel) {
        logger.log('error', `Channel ${(!pollChannel ? '#sondages' : '#sondages-verif')} cannot be found !`);
        client.destroy();
        return;
    }

    if(!config.hasOwnProperty('prefix') || !prefix) {
        logger.log('error', 'Prefix must be defined and not empty !');
        client.destroy();
        return;
    }

    client.guild = guild;
    client.pollChannel = pollChannel;
    client.pollVerifyChannel = pollVerifyChannel;
    client.prefix = prefix;
    client.colors = [
        'AQUA',
        'GREEN',
        'BLUE',
        'PURPLE',
        'GOLD',
        'ORANGE',
        'RED',
        'GREY',
      ];
}

function initCommands() {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
        logger.log('info', `Registered command: ${command.name}`);
    }
}

function initEvents() {
    const events = fs.readdirSync('./events')
        .filter(file => file.endsWith('.js'))
        .map(file => require(`./events/${file}`));

    const eventsFlattened = events.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);
    for(const event of eventsFlattened) {
        client.on(event.name, event.execute);
        logger.log('info', `Registered event: ${event.name}`);
    }
}