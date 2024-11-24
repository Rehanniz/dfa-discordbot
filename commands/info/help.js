const fs = require('fs');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'List all commands available in the bot!',
    adminOnly: false,
    async execute(message, args) {
        const categories = {};
        const emojiMapping = {
            give: '🫴',
            info: '📋',
            inventory: '🎒',
            other: '🔁',
            security: '🤖',
            medic: '🏥',
            home: '🏠',
        };

        const commandsDir = GetResourcePath(GetCurrentResourceName()) + '/commands';
        const folders = fs.readdirSync(commandsDir);

        for (const folder of folders) {
			const folderPath = `${commandsDir}/${folder}`;
			if (fs.lstatSync(folderPath).isDirectory()) {
				categories[folder] = [];
				const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
				for (const file of commandFiles) {
					// Skip framework-specific commands if framework doesn't match
					if ((file.startsWith("rsg-") && framework !== 'rsg-core') || 
						(file.startsWith("vorp-") && framework !== 'vorp-core')) {
						continue;
					}

					const command = require(`${folderPath}/${file}`);
					if (command.name && command.description) {
						categories[folder].push({ name: command.name, description: command.description });
					}
				}
			}
		}

        const options = [
            {
                label: 'Home',
                value: 'home',
                description: 'Return to the main help menu',
                emoji: emojiMapping.home,
            },
            ...Object.keys(categories).map(category => ({
                label: category.charAt(0).toUpperCase() + category.slice(1),
                value: category,
                description: `View commands in the ${category} category`,
                emoji: emojiMapping[category] || '📁',
            })),
        ];

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('help-menu')
                .setPlaceholder('Select a category to view commands')
                .addOptions(options),
        );

        const row2 = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel('Check our Tebex')
                .setStyle('LINK')
                .setURL('https://dfadevelopments.tebex.io')
                .setEmoji('💳'),
            new MessageButton()
                .setLabel('Tip me on Ko-Fi')
                .setStyle('LINK')
                .setURL('https://ko-fi.com/rehanniz')
                .setEmoji('☕')
        );

        const sendMainMenu = async (interaction = null) => {
            const embed = {
                color: 0x1F82D6, // Changed to a slightly darker blue for a more polished look
                title: '**Help Menu**',
                description: `
                    ${config.HelpCmdEmoji} **Select a category** from the dropdown below to explore the available commands.
            
                   ${config.HelpCmdEmoji} Whether you're looking for information or need a quick command reference, everything you need is right here!
                `,
                footer: {
                    text: 'DFA DEVELOPMENTS',
                    icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
                },
                timestamp: new Date(),
            };


            if (interaction) {
                await interaction.update({ embeds: [embed], components: [row, row2] });
                return interaction.message;
            } else {
                const sentMessage = await message.channel.send({ embeds: [embed], components: [row, row2] });
                return sentMessage;
            }
        };

        const initialMessage = await sendMainMenu();

        const collector = initialMessage.createMessageComponentCollector({
            componentType: 'SELECT_MENU',
            time: 60000,
        });

        collector.on('collect', async interaction => {
            const selectedCategory = interaction.values[0];

            if (selectedCategory === 'home') {
                await sendMainMenu(interaction);
            } else {
                const categoryCommands = categories[selectedCategory];
                const categoryEmbed = {
                    color: 0x0099ff,
                    title: `${emojiMapping[selectedCategory] || '📁'} ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`,
                    description: `Here are the commands in the **${selectedCategory}** category:`,
                    fields: categoryCommands.map(cmd => ({
                        name: `\`${config.prefix + cmd.name}\``,
                        value: config.HelpCmdEmoji + cmd.description, // Corrected line
                    })),
                    footer: {
                        text: 'DFA DEVELOPMENTS',
                        icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
                    },
                    timestamp: new Date(),
                };


                await interaction.update({ embeds: [categoryEmbed], components: [row, row2] });
            }
        });

        collector.on('end', () => {
            const disabledRow = new MessageActionRow().addComponents(
                row.components[0].setDisabled(true)
            );
            initialMessage.edit({ components: [disabledRow, row2] });
        });
    },
};
