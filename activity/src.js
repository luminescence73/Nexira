import { DiscordSDK } from '@discord/embedded-app-sdk';
import './style.css';

const state = document.getElementById('state');
const members = document.getElementById('members');
const count = document.getElementById('count');
const refresh = document.getElementById('refresh');
const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

function showMembers(people) {
  count.textContent = String(people.length);
  members.replaceChildren();
  if (!people.length) {
    members.textContent = 'No participants returned.';
    return;
  }
  for (const person of people) {
    const row = document.createElement('div');
    row.className = 'member';
    const name = document.createElement('span');
    name.textContent = person.global_name || person.username || 'Discord member';
    row.append(name);
    members.append(row);
  }
}

if (!clientId) {
  state.textContent = 'Missing Activity client ID';
  members.textContent = 'Set VITE_DISCORD_CLIENT_ID in Railway, then redeploy.';
  refresh.disabled = true;
} else {
  const sdk = new DiscordSDK(clientId);
  async function loadParticipants() {
    try {
      const response = await sdk.commands.getInstanceConnectedParticipants();
      showMembers(response.participants || []);
    } catch (error) {
      console.error('Unable to load participants:', error);
      members.textContent = 'Could not load participants. Try Refresh.';
    }
  }
  sdk.ready().then(() => {
    state.textContent = 'Connected to Discord';
    loadParticipants();
    refresh.addEventListener('click', loadParticipants);
  }).catch(error => {
    console.error('Discord Activity initialization failed:', error);
    state.textContent = 'Launch this Activity inside Discord';
    members.textContent = 'This page must be opened as a Discord Activity.';
    refresh.disabled = true;
  });
}
