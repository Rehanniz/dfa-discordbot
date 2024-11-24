const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'givemoney',
    description: 'Give money to a player!',
    adminOnly: true,
    async execute(message, args) {
        // Validate arguments
        if (!args[0] || !args[1] || !args[2]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}givemoney [id] [type] [amount]\`\n**Example:** \`${config.prefix}givemoney 1 cash 1000\``
            );
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ **Error:** The Player ID must be a valid number!');
        }

        const type = args[1].toLowerCase();
        const moneyTypeMapping = { cash: 0, gold: 1 }; // Map money types to VORP Core identifiers
        const moneyType = moneyTypeMapping[type];

        if (moneyType === undefined) {
            return message.reply(
                `❌ **Error:** Invalid money type!\n**Valid types:** ${Object.keys(moneyTypeMapping)
                    .map((t) => `\`${t}\``)
                    .join(', ')}`
            );
        }

        const amount = parseInt(args[2]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ **Error:** The amount must be a valid positive number!');
        }

        // Create the embed for the response
        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        // Log the command execution
        sendLog(
            `givemoney command executed by ${message.author.tag} for Player ID: ${playerId} with Type: ${type} and Amount: ${amount}`
        );

        const character = VORPcore.getUser(playerId)?.getUsedCharacter;
        if (!character) {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Found!';
            embed.description = `Player **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Give Money **failed**.', inline: true },
            ];
            return message.channel.send({ embeds: [embed] });
        }

        const characterName = `${character.firstname} ${character.lastname}`;
        const prevMoney = character[moneyType === 0 ? 'money' : 'gold'] || 0;

        // Add money to the player
        character.addCurrency(moneyType, amount);

        // Log the successful money transfer
        const fields = [
            { name: '👤 Name', value: `\`${characterName}\``, inline: true },
            { name: '💰 Previous Amount', value: `**$${prevMoney.toLocaleString()}**`, inline: true },
            { name: '💰 Amount Given', value: `**$${amount.toLocaleString()}**`, inline: true },
            { name: '📦 Money Type', value: `**${type.charAt(0).toUpperCase() + type.slice(1)}**`, inline: true },
            { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
        ];

        sendLog(
            message.client,
            '🚨 Give Money',
            `Successfully gave $${amount.toLocaleString()} (${type}) to Player ID: ${playerId} (${characterName})`,
            0x00ff00,
            fields
        );

        embed.color = 0x00ff00;
        embed.title = '✅ Money Transfer Successful!';
        embed.description = `**Player:** ${characterName} (ID: **${playerId}**)\n**Amount Given:** $${amount.toLocaleString()}\n**Type:** ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        embed.fields = [
            { name: '💰 Previous Amount', value: `**$${prevMoney.toLocaleString()}**`, inline: true },
            { name: '💰 New Amount', value: `**$${(prevMoney + amount).toLocaleString()}**`, inline: true },
            { name: '📦 Money Type', value: `**${type.charAt(0).toUpperCase() + type.slice(1)}**`, inline: true },
        ];

        message.channel.send({ embeds: [embed] });
    },
};
