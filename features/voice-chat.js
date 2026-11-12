import { ChannelType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

// Voice features stay independent of Nexira's other systems.
// No extra channels, message reposting, pings, or TTS.
const recentMessages = new Map();
const MAX_MESSAGES = 25;

export const voiceCommands = [
  new SlashCommandBuilder()
    .setName('vc')
    .setDescription('Voice-channel accessibility tools')
    .addSubcommand(command =>
      command.setName('status').setDescription('See who is in your current voice channel'))
    .addSubcommand(command =>
      command.setName('chat').setDescription('Read recent native voice-channel chat messages privately')),
];

function getVoiceChannel(interaction) {
  const channel = interaction.member?.voice?.channel;
  return channel && (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice)
    ? channel : null;
}

export async function handleVoiceInteraction(interaction) {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'vc') return false;
  const channel = getVoiceChannel(interaction);
  if (!channel) {
    await interaction.reply({ content: 'Join a voice channel first to use this command.', ephemeral: true });
    return true;
  }

  const subcommand = interaction.options.getSubcommand();
  if (subcommand === 'status') {
    const participants = [...channel.members.values()]
      .map(member => member.displayName)
      .sort((a, b) => a.localeCompare(b));
    const embed = new EmbedBuilder()
      .setTitle('Voice channel: ' + channel.name)
      .setDescription(participants.length ? participants.map(name => '• ' + name).join('\n').slice(0, 3900) : 'No participants')
      .setFooter({ text: participants.length + ' participant(s)' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return true;
  }

  if (subcommand === 'chat') {
    // Voice-channel text is already part of Discord; this command does not mirror it elsewhere.
    // Read a short window from Discord on demand, without storing chat on disk.
    await interaction.deferReply({ ephemeral: true });
    try {
      const fetched = await channel.messages.fetch({ limit: MAX_MESSAGES });
      const lines = [...fetched.values()]
        .filter(message => !message.author.bot && message.content?.trim())
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .slice(-12)
        .map(message => {
          const author = message.member?.displayName ?? message.author.username;
          const content = message.content.replace(/\s+/g, ' ').slice(0, 180);
          return '**' + author.replace(/[*_`~|]/g, '') + ':** ' + content.replace(/@/g, '@\u200b');
        });
      await interaction.editReply({
        content: lines.length
          ? '**Recent chat in ' + channel.name.replace(/[*_`~|]/g, '') + '**\n' + lines.join('\n').slice(0, 1800)
          : 'No recent text messages in this voice channel.',
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error('[voice] Could not read voice-channel chat:', error);
      await interaction.editReply('I could not read this voice channel’s chat. Check my View Channel and Read Message History permissions.');
    }
    return true;
  }
  return false;
}

export function registerVoiceListeners(client) {
  client.on('voiceStateUpdate', (previous, current) => {
    if (previous.channelId === current.channelId) return;
    // Local event only. No public join/leave announcements.
    console.log('[voice] Channel membership changed in guild ' + (current.guild?.id ?? previous.guild?.id));
  });
}
