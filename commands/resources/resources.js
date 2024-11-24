const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'resources',
    description: 'Get the list of started and stopped resources.',
    adminOnly: true,
    async execute(message, args) {
        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        const startedResources = [];
        const stoppedResources = [];

        for (let i = 0; i < GetNumResources(); i++) {
            const resourceName = GetResourceByFindIndex(i);
            const resourceState = GetResourceState(resourceName);

            if (resourceState === 'started') {
                startedResources.push(resourceName);
            } else {
                stoppedResources.push(resourceName);
            }
        }

        const mixedResources = [];
        let startedIndex = 0;
        let stoppedIndex = 0;

        while (startedIndex < startedResources.length || stoppedIndex < stoppedResources.length) {
            if (startedIndex < startedResources.length) {
                mixedResources.push({ name: startedResources[startedIndex], state: 'Started', emoji: '🟢' });
                startedIndex++;
            }
            if (stoppedIndex < stoppedResources.length) {
                mixedResources.push({ name: stoppedResources[stoppedIndex], state: 'Stopped', emoji: '🔴' });
                stoppedIndex++;
            }
        }

        const resourcesPerPage = 10;
        const pages = [];
        const totalResources = mixedResources.length;
        const totalPages = Math.ceil(totalResources / resourcesPerPage);

        for (let i = 0; i < mixedResources.length; i += resourcesPerPage) {
            const currentPage = mixedResources.slice(i, i + resourcesPerPage);
            const embed = new MessageEmbed()
            embed.title = `Resources List | Total: ${totalResources} Resources (Page ${Math.floor(i / resourcesPerPage) + 1} of ${totalPages})`
            embed.description = currentPage.map((resource, index) => `${i + index + 1} | ${resource.name} | ${resource.state} ${resource.emoji}`).join('\n')
            embed.color = 'BLUE'
            pages.push(embed);
        }

        let currentPage = 0;

        const prevButton = new MessageButton()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle('PRIMARY')
            .setEmoji('⬅️')
            .setDisabled(true);

        const nextButton = new MessageButton()
            .setCustomId('nextpg')
            .setLabel('Next')
            .setEmoji('➡️')
            .setStyle('PRIMARY');

        const firstButton = new MessageButton()
            .setCustomId('first')
            .setLabel('First')
            .setStyle('SECONDARY')
            .setEmoji('⏪')
            .setDisabled(true);

        const endButton = new MessageButton()
            .setCustomId('end')
            .setLabel('End')
            .setEmoji('⏩')
            .setStyle('SECONDARY');

        const row = new MessageActionRow().addComponents(firstButton, prevButton, nextButton, endButton);

        const sentMessage = await message.channel.send({
            embeds: [pages[currentPage]],
            components: [row],
        });

        const filter = (interaction) => interaction.user.id === message.author.id;

        const collector = sentMessage.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'nextpg') {
                if (currentPage < pages.length - 1) {
                    currentPage++;
                }
                nextButton.setDisabled(currentPage === pages.length - 1);
                prevButton.setDisabled(false);
                firstButton.setDisabled(false);
                endButton.setDisabled(currentPage === pages.length - 1);
                await interaction.update({ embeds: [pages[currentPage]], components: [row] });
            }

            if (interaction.customId === 'prev') {
                if (currentPage > 0) {
                    currentPage--;
                }
                prevButton.setDisabled(currentPage === 0);
                nextButton.setDisabled(false);
                firstButton.setDisabled(currentPage === 0);
                endButton.setDisabled(false);
                await interaction.update({ embeds: [pages[currentPage]], components: [row] });
            }

            if (interaction.customId === 'first') {
                currentPage = 0;
                firstButton.setDisabled(true);
                prevButton.setDisabled(true);
                nextButton.setDisabled(false);
                endButton.setDisabled(false);
                await interaction.update({ embeds: [pages[currentPage]], components: [row] });
            }

            if (interaction.customId === 'end') {
                currentPage = pages.length - 1;
                endButton.setDisabled(true);
                nextButton.setDisabled(true);
                prevButton.setDisabled(false);
                firstButton.setDisabled(false);
                await interaction.update({ embeds: [pages[currentPage]], components: [row] });
            }
        });

        collector.on('end', () => {
            sentMessage.edit({ components: [] });
        });
    }
};
