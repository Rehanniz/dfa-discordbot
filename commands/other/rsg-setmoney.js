const { sendLog } = require('../../Events/logFunction');
module.exports = {
    name: 'setmoney',
    description: 'Set a player’s money!',
    adminOnly: true,
    async execute(message, args) {
        if (!args[0] || !args[1] || !args[2]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}setmoney [id] [type] [amount]\`\n**Example:** \`${config.prefix}setmoney 1 cash 1000\``
            );
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ **Error:** Player ID must be a valid number!');
        }

        const type = args[1].toLowerCase();
        if (!config.validBankTypes.includes(type)) {
            return message.reply(
                `❌ **Error:** Invalid money type!\n**Valid types:** ${validBankTypes.map(w => `\`${w}\``).join(', ')}`
            );
        }

        const amount = parseInt(args[2]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ **Error:** Amount must be a valid positive number!');
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
            Player.Functions.SetMoney(type, amount, 'Admin set money');
            embed.color = 0x00ff00;
            embed.title = '✅ Money Set Successfully!';
            embed.description = `**Player:** ${GetPlayerName(playerId)} (ID: **${playerId}**) now has **$${amount}** in their **${type}** balance.`;
            embed.fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: '💰 Balance Updated', value: `**$${amount}**`, inline: true },
                { name: '💼 Money Type', value: `\`${type.charAt(0).toUpperCase() + type.slice(1)}\``, inline: true },
            ];
            message.channel.send({ embeds: [embed] });

            const logFields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: '💰 Balance Updated', value: `**$${amount}**`, inline: true },
                { name: '💼 Money Type', value: `\`${type.charAt(0).toUpperCase() + type.slice(1)}\``, inline: true },
                { name: '👤 Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
            ];

            sendLog(
                message.client,
                '💰 Money Set Log',
                `Money has been successfully updated for **${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}**.`,
                0x00ff00, // Green for success
                logFields
            );

        } else {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Found!';
            embed.description = `The player with ID **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Set Money **Failed**!', inline: true },
            ];
            message.channel.send({ embeds: [embed] });
        }
    },
};
