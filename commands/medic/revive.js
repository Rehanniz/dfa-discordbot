const { sendLog } = require('../../Events/logFunction');
const config = require('../../config.json'); // Adjust the path as needed
module.exports = {
    name: 'revive',
    description: 'Revive a player!',
    adminOnly: true,
    execute(message, args) {
        if (!args[0]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}revive [id]\`\n**Example:** \`${config.prefix}revive 1\``
            );
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ **Error:** Player ID must be a valid number!');
        }

        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        const Player = RSGCore.Functions.GetPlayer(playerId);
        if (Player) {
            const PlayerData = Player.PlayerData;

            // Use the configuration to determine the prefix
            const medicPrefix = config.QC_Medic ? 'QC-AdvancedMedic' : 'rsg-medic';
            emitNet(`${medicPrefix}:client:playerRevive`, playerId);

            embed.color = 0x00ff00;
            embed.title = '✨ Player Revived Successfully!';
            embed.description = `**Player:** ${GetPlayerName(playerId)} (ID: **${playerId}**) has been brought back to life!`;
            embed.fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: '🏥 Action', value: '**Revived**', inline: true },
            ];

            message.channel.send({ embeds: [embed] });
            const fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
            ];

            sendLog(
                message.client,
                '🚨 Player Revived',
                `Player **${GetPlayerName(playerId)}** (ID: ${playerId}) was revived successfully by <@${message.author.id}>..`,
                0x00ff00,
                fields
            );

        } else {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Found!';
            embed.description = `The player with ID **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Revive attempt **failed**!', inline: true },
            ];

            message.channel.send({ embeds: [embed] });

            sendLog(
                message.client,
                '❌ Player Not Found',
                `Attempted to revive player **${playerId}**, but the player was not found or is offline.`,
                0xff0000,
                embed.fields
            );
        }
    },
};
