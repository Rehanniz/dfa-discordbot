const { sendLog } = require('../../Events/logFunction');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  name: 'playerinfo',
  description: 'Displays player information with different sections.',
  adminOnly: true,
  async execute(message, args) {
    if (!args[0]) {
      return message.reply(
        `❓ **Usage:** \`${config.prefix}playerinfo [id] \`\n**Example:** \`${config.prefix}playerinfo 1 \``
      );
    }
    const player = parseInt(args[0]);
    const Player = RSGCore.Functions.GetPlayer(player);
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

      embed.title = `Player Info - ${PlayerData.name} (ID: ${player})`;
      embed.description = `Click the buttons below to explore different sections:`;
      embed.fields = [
        { name: 'Name', value: `\`${PlayerData.name}\``, inline: true },
        { name: 'Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
        { name: 'Ping', value: `\`${GetPlayerPing(player)}\``, inline: true },
        { name: 'X', value: `\`${PlayerData.position.x || 0}\``, inline: true },
        { name: 'Y', value: `\`${PlayerData.position.y || 0}\``, inline: true },
        { name: 'Z', value: `\`${PlayerData.position.z || 0}\``, inline: true },
      ];

      // Buttons setup
      const buttons = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('Home').setLabel('Home').setStyle('SECONDARY').setDisabled(true),
        new MessageButton().setCustomId('Charinfo').setLabel('Character Info').setStyle('PRIMARY'),
        new MessageButton().setCustomId('Job').setLabel('Job').setStyle('PRIMARY'),
        new MessageButton().setCustomId('Money').setLabel('Money').setStyle('PRIMARY'),
        new MessageButton().setCustomId('Metadata').setLabel('Metadata').setStyle('PRIMARY'),
      );

      // Send the initial message
      const sentMessage = await message.channel.send({
        embeds: [embed],
        components: [buttons],
      });

      // Interaction collector setup
      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = sentMessage.createMessageComponentCollector({
        filter,
        time: 60000,  // 1 minute duration for interaction
      });

      collector.on('collect', async (interaction) => {
        // Handle button clicks
        if (interaction.customId === 'Home') {
          buttons.components.forEach((btn) => btn.setDisabled(false).setStyle('PRIMARY'));
          buttons.components[0].setDisabled(true).setStyle('SECONDARY');
          embed.fields = [
            { name: 'Name', value: `\`${PlayerData.name}\``, inline: true },
            { name: 'Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
            { name: 'Ping', value: `\`${GetPlayerPing(player)}\``, inline: true },
            { name: 'X', value: `\`${PlayerData.position.x || 0}\``, inline: true },
            { name: 'Y', value: `\`${PlayerData.position.y || 0}\``, inline: true },
            { name: 'Z', value: `\`${PlayerData.position.z || 0}\``, inline: true },
          ];
          await interaction.update({ embeds: [embed], components: [buttons] });
        } else if (interaction.customId === 'Charinfo') {
          buttons.components.forEach((btn) => btn.setDisabled(false).setStyle('PRIMARY'));
          buttons.components[1].setDisabled(true).setStyle('SECONDARY');
          embed.fields = [
            { name: 'First Name', value: `\`${PlayerData.charinfo.firstname}\``, inline: true },
            { name: 'Last Name', value: `\`${PlayerData.charinfo.lastname}\``, inline: true },
            { name: 'Birth Date', value: `\`${PlayerData.charinfo.birthdate}\``, inline: true },
            { name: 'Gender', value: `\`${PlayerData.charinfo.gender === 0 ? 'Male' : 'Female'}\``, inline: true },
            { name: 'Nationality', value: `\`${PlayerData.charinfo.nationality}\``, inline: true },
          ];
          await interaction.update({ embeds: [embed], components: [buttons] });
        } else if (interaction.customId === 'Job') {
          buttons.components.forEach((btn) => btn.setDisabled(false).setStyle('PRIMARY'));
          buttons.components[2].setDisabled(true).setStyle('SECONDARY');
          embed.fields = [
            { name: 'Job Type', value: `\`${PlayerData.job.type}\``, inline: true },
            { name: 'Job Name', value: `\`${PlayerData.job.name}\``, inline: true },
            { name: 'Job Label', value: `\`${PlayerData.job.label}\``, inline: true },
            { name: 'On Duty', value: `\`${PlayerData.job.onduty ? 'Yes' : 'No'}\``, inline: true },
            { name: 'Job Grade', value: `\`${PlayerData.job.grade.name}\``, inline: true },
            { name: 'Grade Level', value: `\`${PlayerData.job.grade.level}\``, inline: true },
            { name: 'Grade Payment', value: `\`${PlayerData.job.grade.payment}\``, inline: true },
            { name: 'Job Payment', value: `\`${PlayerData.job.payment}\``, inline: true },
            { name: 'Is Boss (Job)', value: `\`${PlayerData.job.isboss ? 'Yes' : 'No'}\``, inline: true },
            { name: 'Is Boss (Grade)', value: `\`${PlayerData.job.grade.isboss ? 'Yes' : 'No'}\``, inline: true },
          ];
          await interaction.update({ embeds: [embed], components: [buttons] });

        } else if (interaction.customId === 'Money') {

          buttons.components.forEach((btn) => btn.setDisabled(false).setStyle('PRIMARY'));
          buttons.components[3].setDisabled(true).setStyle('SECONDARY');
          embed.fields = Object.entries(PlayerData.money).map(([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: `\`$${value || 0}\``,
            inline: true,
          }));
          await interaction.update({ embeds: [embed], components: [buttons] });
        } else if (interaction.customId === 'Metadata') {
          buttons.components.forEach((btn) => btn.setDisabled(false).setStyle('PRIMARY'));
          buttons.components[4].setDisabled(true).setStyle('SECONDARY');
          embed.fields = [
            { name: 'Wallet ID', value: `\`${PlayerData.metadata.walletid}\``, inline: true },
            { name: 'Criminal Record', value: `\`${PlayerData.metadata.criminalrecord.hasRecord ? 'Yes' : 'No'}\``, inline: true },
            { name: 'Callsign', value: `\`${PlayerData.metadata.callsign}\``, inline: true },
            { name: 'Is Dead?', value: `\`${PlayerData.metadata.isdead ? 'Yes' : 'No'}\``, inline: true },
            { name: 'Thirst', value: `\`${PlayerData.metadata.thirst.toFixed(1)}%\``, inline: true },
            { name: 'Hunger', value: `\`${PlayerData.metadata.hunger.toFixed(1)}%\``, inline: true },
            { name: 'Armor', value: `\`${PlayerData.metadata.armor}\``, inline: true },
            { name: 'Stress', value: `\`${PlayerData.metadata.stress}%\``, inline: true },
            { name: 'Health', value: `\`${PlayerData.metadata.health}\``, inline: true },
            { name: 'Fingerprint', value: `\`${PlayerData.metadata.fingerprint}\``, inline: true },
            { name: 'Cleanliness', value: `\`${PlayerData.metadata.cleanliness}%\``, inline: true },
            { name: 'Blood Type', value: `\`${PlayerData.metadata.bloodtype}\``, inline: true },
            { name: 'In Jail', value: `\`${PlayerData.metadata.injail ? 'Yes' : 'No'}\``, inline: true }
          ];

          await interaction.update({ embeds: [embed], components: [buttons] });

        }
      });

      collector.on('end', () => {
        buttons.components.forEach((button) => button.setDisabled(true));
        sentMessage.edit({ components: [buttons] });
      });
    } else {

      embed.color = 0xff0000;
      embed.title = '❌ Error: Player Not Found!';
      embed.description = `The player with ID **${player}** is either offline or does not exist.`;
      embed.fields = [
        { name: '🛑 Action', value: 'Player Info **Failed**!', inline: true },
      ];

      message.channel.send({ embeds: [embed] });
    }
  },
};


