const { sendLog } = require('../../Events/logFunction');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  name: 'playerinfo',
  description: 'Displays player information with different sections.',
  adminOnly: true,
  async execute(message, args) {
    if (!args[0]) {
      return message.reply(
        `❓ **Usage:** \`${config.prefix}playerinfo [id]\`\n**Example:** \`${config.prefix}playerinfo 1\``
      );
    }

    const playerId = parseInt(args[0]);
    if (isNaN(playerId)) {
      return message.reply('❌ Invalid player ID. Please provide a valid numeric ID.');
    }

    const embed = {
      color: 0x0099ff,
      timestamp: new Date(),
      footer: {
        text: 'DFA DEVELOPMENTS',
        icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png',
      },
    };

    if (!GetPlayerName(playerId)) {
      embed.color = 0xff0000;
      embed.title = '❌ Error: Player Not Found!';
      embed.description = `The player with ID **${playerId}** is either offline or does not exist.`;
      embed.fields = [
        { name: '🛑 Action', value: 'Player Info **Failed**!', inline: true },
      ];
      return message.channel.send({ embeds: [embed] });
    }

    const character = VORPcore.getUser(playerId)?.getUsedCharacter;
    if (!character) {
      embed.color = 0xff0000;
      embed.title = '❌ Error: Character Not Found';
      embed.description = `The character for player **${playerId}** could not be retrieved.`;
      return message.channel.send({ embeds: [embed] });
    }

    embed.title = `Player Info - ${character.firstname} ${character.lastname} (ID: ${playerId})`;
    embed.description = `Click the buttons below to explore different sections:`;
    embed.fields = [
      { name: 'Name', value: `\`${character.firstname} ${character.lastname}\``, inline: true },
      { name: 'Character ID', value: `\`${character.charIdentifier}\``, inline: true },
      { name: 'Ping', value: `\`${GetPlayerPing(playerId)}\``, inline: true },
      { name: 'Coords', value: `\`${character.coords}\``, inline: true },
    ];

    const buttons = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('Home').setLabel('Home').setStyle('SECONDARY').setDisabled(true),
      new MessageButton().setCustomId('Charinfo').setLabel('Character Info').setStyle('PRIMARY'),
      new MessageButton().setCustomId('Job').setLabel('Job').setStyle('PRIMARY'),
      new MessageButton().setCustomId('Money').setLabel('Money').setStyle('PRIMARY'),
      new MessageButton().setCustomId('Metadata').setLabel('Metadata').setStyle('PRIMARY')
    );

    const sentMessage = await message.channel.send({ embeds: [embed], components: [buttons] });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      buttons.components.forEach((btn) => btn.setDisabled(false).setStyle('PRIMARY'));

      if (interaction.customId === 'Home') {
        buttons.components[0].setDisabled(true).setStyle('SECONDARY');
        embed.fields = [
          { name: 'Name', value: `\`${character.firstname} ${character.lastname}\``, inline: true },
          { name: 'Character ID', value: `\`${character.charIdentifier}\``, inline: true },
          { name: 'Ping', value: `\`${GetPlayerPing(playerId)}\``, inline: true },
          { name: 'Coords', value: `\`${character.coords}\``, inline: true },
        ];
      } else if (interaction.customId === 'Charinfo') {
        buttons.components[1].setDisabled(true).setStyle('SECONDARY');
        embed.fields = [
          { name: 'First Name', value: `\`${character.firstname}\``, inline: true },
          { name: 'Last Name', value: `\`${character.lastname}\``, inline: true },
          { name: 'Age', value: `\`${character.age}\``, inline: true },
          { name: 'Gender', value: `\`${character.gender || 'N/A'}\``, inline: true },
          { name: 'Nickname', value: `\`${character.nickname || 'N/A'}\``, inline: true },
          { name: 'Description', value: `\`${character.charDescription || 'N/A'}\``, inline: true },
        ];
      } else if (interaction.customId === 'Job') {
        buttons.components[2].setDisabled(true).setStyle('SECONDARY');
        embed.fields = [
          { name: 'Job Name', value: `\`${character.job}\``, inline: true },
          { name: 'Job Label', value: `\`${character.jobLabel}\``, inline: true },
          { name: 'Job Grade', value: `\`${character.jobGrade}\``, inline: true },
        ];
      } else if (interaction.customId === 'Money') {
        buttons.components[3].setDisabled(true).setStyle('SECONDARY');
        embed.fields = [
          { name: 'Money', value: `\`$${character.money}\``, inline: true },
          { name: 'Gold', value: `\`${character.gold || 0}\``, inline: true },
        ];
      } else if (interaction.customId === 'Metadata') {
        buttons.components[4].setDisabled(true).setStyle('SECONDARY');
        embed.fields = [
		  { name: 'XP', value: `\`${character.xp || 'N/A'}\``, inline: true },
          { name: 'Status', value: `\`${character.status || 'N/A'}\``, inline: true },
          { name: 'Is Dead?', value: `\`${character.isdead ? 'Yes' : 'No'}\``, inline: true },
          { name: 'Inventory Capacity', value: `\`${character.invCapacity || 'N/A'}\``, inline: true },
        ];
      }

      await interaction.update({ embeds: [embed], components: [buttons] });
    });

    collector.on('end', () => {
      buttons.components.forEach((button) => button.setDisabled(true));
      sentMessage.edit({ components: [buttons] });
    });
  },
};
