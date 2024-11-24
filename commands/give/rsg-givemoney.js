const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'givemoney',
    description: 'Give money to a player!',
    adminOnly: true,
    async execute(message, args) {
        // Check if arguments are provided
        if (!args[0] || !args[1] || !args[2]) {
            return message.reply(`❓ **Usage:** \`${config.prefix}givemoney [id] [type] [amount]\`\n**Example:** \`${config.prefix}givemoney 1 cash 1000\``);
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ **Error:** The Player ID must be a valid number!');
        }

        const type = args[1].toLowerCase();
        if (!config.validBankTypes.includes(type)) {
            return message.reply(
                `❌ **Error:** Invalid money type!\n**Valid types:** ${validBankTypes.map(w => `\`${w}\``).join(', ')}`
            );
        }

        const amount = parseInt(args[2]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ **Error:** The amount must be a valid positive number!');
        }

        // Create an embed for the response
        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        // Log the command execution
        sendLog(`givemoney command executed by ${message.author.tag} for Player ID: ${playerId} with Type: ${type} and Amount: ${amount}`);

        const Player = RSGCore.Functions.GetPlayer(playerId);
        if (Player) {
            const PlayerData = Player.PlayerData;
            // Add the money to the player
            Player.Functions.AddMoney(type, amount, 'Admin give money');

            // Log the money transfer success
            const fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: '💰 Amount', value: `**$${amount.toLocaleString()}**`, inline: true },
                { name: '📦 Money Type', value: `**${type.charAt(0).toUpperCase() + type.slice(1)}**`, inline: true },
                { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
            ];

            sendLog(
                message.client,
                '🚨 Give Money',
                `Successfully gave $${amount} (${type}) to Player ID: ${playerId} (${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}))`,
                0x00ff00,
                fields
            );
            embed.color = 0x00ff00;
            embed.title = '✅ Money Transfer Successful!';
            embed.description = `**Player:** ${GetPlayerName(playerId)} (ID: **${playerId}**)\n**Amount Given:** $${amount}\n**Type:** ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            embed.fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: '💰 Amount', value: `**$${amount.toLocaleString()}**`, inline: true },
                { name: '📦 Money Type', value: `**${type.charAt(0).toUpperCase() + type.slice(1)}**`, inline: true },
            ];
            message.channel.send({ embeds: [embed] });
        } else {
            embed.color = 0xff0000;
            embed.title = '❌ Player Not Found!';
            embed.description = `The player with ID **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Give Money **failed**.', inline: true },
            ];
            message.channel.send({ embeds: [embed] });
        }
    },
};
