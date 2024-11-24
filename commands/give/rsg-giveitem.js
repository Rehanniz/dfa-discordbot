const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'giveitem',
    description: 'Give an item to a player!',
    adminOnly: true,
    execute(message, args) {
        if (!args[0] || !args[1] || !args[2]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}giveitem [player_id] [item] [amount]\`\nExample: \`${config.prefix}giveitem 1 bread 2\``
            );
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ **Player ID must be a valid number!**');
        }

        const item = args[1].toString().toLowerCase();
        const amount = parseInt(args[2]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ **Amount must be a valid positive number!**');
        }

        // Log the command execution
        sendLog(`giveitem command executed by ${message.author.tag} for Player ID: ${playerId} with Item: ${item} and Amount: ${amount}`);

        const Player = RSGCore.Functions.GetPlayer(playerId);
        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        if (Player) {
            const PlayerData = Player.PlayerData;
            const success = Player.Functions.AddItem(item, amount);

            if (success) {
                // Log the successful item addition
                const fields = [
                    { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                    { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                    { name: 'Item', value: item.charAt(0).toUpperCase() + item.slice(1), inline: true },
                    { name: 'Amount', value: amount.toString(), inline: true },
                    { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
                ];

                sendLog(
                    message.client,
                    '🚨 Give Item',
                    `Successfully gave ${amount}x ${item.charAt(0).toUpperCase() + item.slice(1)} to Player ID: ${playerId} (${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname})`,
                    0x00ff00,
                    fields
                );
                embed.color = 0x00ff00;
                embed.title = '✅ Item Given';
                embed.description = `**${amount}x ${item.charAt(0).toUpperCase() + item.slice(1)}** has been successfully added to **${Player.PlayerData.name}** (ID: ${playerId}).`;
                embed.fields = [
                    { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                    { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                    { name: 'Item', value: item.charAt(0).toUpperCase() + item.slice(1), inline: true },
                    { name: 'Amount', value: amount.toString(), inline: true },
                ];
            } else {
                embed.color = 0xff0000;
                embed.title = '❌ Failed to Add Item';
                embed.description = `Item **${item.charAt(0).toUpperCase() + item.slice(1)}** does not exist, or the player does not have enough weight capacity!`;
            }
            message.channel.send({ embeds: [embed] });
        } else {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Online';
            embed.description = `Player **${playerId}** is not online or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Give Item **Failed**!', inline: true },
            ];
            message.channel.send({ embeds: [embed] });
        }
    },
};
