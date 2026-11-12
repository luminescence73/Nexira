import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { handleVoiceInteraction, registerVoiceListeners, voiceCommands } from './features/voice-chat.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN. Add it to Railway Variables.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

registerVoiceListeners(client);

client.once(Events.ClientReady, async ready => {
  console.log('Nexira online as ' + ready.user.tag);
  try {
    // Global registration needs no guild ID; commands may take time to appear.
    await ready.application.commands.set(voiceCommands.map(command => command.toJSON()));
    console.log('Voice commands registered: /vc status, /vc chat');
  } catch (error) {
    console.error('Failed to register voice commands:', error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    await handleVoiceInteraction(interaction);
  } catch (error) {
    console.error('Interaction error:', error);
    if (!interaction.isRepliable()) return;
    const message = { content: 'Something went wrong. Please try again.', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(message).catch(console.error);
    } else {
      await interaction.reply(message).catch(console.error);
    }
  }
});

client.on(Events.Error, error => console.error('Discord client error:', error));
client.login(token).catch(error => {
  console.error('Nexira could not connect to Discord:', error);
  process.exitCode = 1;
});
