const { sendLog } = require('../../Events/logFunction');
module.exports = {
    name: 'kick',
    description: 'Kick a player from the game.',
    adminOnly: true,
    async execute(message, args) {
        if (args.length < 2) {
            return message.channel.send(
                '❌ **Usage:** `!kick <playerID> <reason>`\nYou must specify a player ID and a reason for the kick.'
            );
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId) || playerId <= 0) {
            return message.channel.send('❌ **Error:** Invalid `playerID`. It must be a positive number.');
        }

        const reason = args.slice(1).join(' ').trim();
        if (!reason || reason.length < 5) {
            return message.channel.send(
                '❌ **Error:** The kick reason is too short. Please provide a meaningful reason (minimum 5 characters).'
            );
        }

        const Player = RSGCore.Functions.GetPlayer(playerId);

        if (Player) {
            DropPlayer(playerId, reason)
            const embed = {
                color: 0x0099ff,
                timestamp: new Date(),
                title: '🚪 Player Kicked',
                fields: [
                    { name: 'Player ID', value: `${playerId}`, inline: true },
                    { name: 'Reason', value: reason },
                ],
                footer: {
                    text: 'DFA DEVELOPMENTS',
                    icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
                },
            };
            await message.channel.send({ embeds: [embed] });
            const fields = [
                { name: 'Player ID', value: `${playerId}`, inline: true },
                { name: 'Reason', value: reason },
                { name: 'Kicked BY', value: `<@${message.author.id}>`, inline: true },
            ];
            sendLog(client, '🚨 Player Kicked', `Player with ID \`${playerId}\` has been kicked from the server.`, 0xff0000, fields);
        } else {
            const embed = {
                color: 0xff0000,
                timestamp: new Date(),
                title: '❌ Error: Player Not Found!',
                description: `The player with ID **${playerId}** is either offline or does not exist.`,
                fields: [
                    { name: '🛑 Action', value: 'Kick Player **Failed**!', inline: true },
                ],
                footer: {
                    text: 'DFA DEVELOPMENTS',
                    icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
                },
            };
            await message.channel.send({ embeds: [embed] });
        }
    },
};
