const { sendLog } = require('../../Events/logFunction');
const config = require('../../config.json'); // Adjust the path as needed

module.exports = {
    name: 'heal',
    description: 'Heal a player!',
    adminOnly: true,
    execute(message, args) {
        // Validate that an ID was provided
        if (!args[0]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}heal [id]\`\n**Example:** \`${config.prefix}heal 1\``
            );
        }

        // Ensure playerId is a valid number
        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ **Error:** Player ID must be a valid number!');
        }

        // Default embed structure
        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        // Attempt to find the player using the provided playerId
        const Player = RSGCore.Functions.GetPlayer(playerId);
        if (Player) {
            const PlayerData = Player.PlayerData;

            // Emit an event to heal the player (make sure your server-side handler listens to this event)
            emitNet('rsg-medic:client:adminHeal', playerId);

            // Set up success embed
            embed.color = 0x00ff00;
            embed.title = '✅ Player Healed Successfully!';
            embed.description = `**Player:** ${GetPlayerName(playerId)} (ID: **${playerId}**) has been fully healed!`;
            embed.fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: '🏥 Action', value: '**Heal**', inline: true },
            ];

            // Send success message
            message.channel.send({ embeds: [embed] });

            // Log the success
            const fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
            ];

            sendLog(
                message.client,
                '🚨 Heal',
                `Player **${GetPlayerName(playerId)}** (ID: ${playerId}) has been healed successfully by <@${message.author.id}>..`,
                0x00ff00,
                fields
            );

        } else {
            // Set up failure embed
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Found!';
            embed.description = `The player with ID **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Heal attempt **failed**.', inline: true },
            ];

            // Send failure message
            message.channel.send({ embeds: [embed] });

            // Log the failure
            sendLog(
                message.client,
                '❌ Player Not Found',
                `Attempted to heal player **${playerId}**, but they were not found or are offline.`,
                0xff0000,
                embed.fields
            );
        }
    },
};
