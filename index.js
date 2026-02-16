import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes, Events } from "discord.js"; import { QuickDB } from "quick.db";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] }); const db = new QuickDB();

const canalLogs = "1471187137595441152";

const commands = [ new SlashCommandBuilder().setName("painel").setDescription("Abrir painel"), new SlashCommandBuilder().setName("partida").setDescription("Finalizar partida") ].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => { await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands }); })();

client.on(Events.InteractionCreate, async interaction => { if (!interaction.isChatInputCommand()) return;

if (interaction.commandName === "painel") { const embed = new EmbedBuilder() .setTitle("ORG TK 💰") .setDescription("Vem farmar na ORG TK 🔥");

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("perfil").setLabel("Perfil").setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId("ranking").setLabel("Ranking").setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId("loja").setLabel("Loja").setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId("inventario").setLabel("Inventário").setStyle(ButtonStyle.Secondary)
);

interaction.reply({ embeds: [embed], components: [row] });

}

if (interaction.commandName === "partida") { const coins = Math.floor(Math.random() * 10) + 1; const xp = Math.floor(Math.random() * 50) + 10;

await db.add(`coins_${interaction.user.id}`, coins);
await db.add(`xp_${interaction.user.id}`, xp);

interaction.reply(`Você ganhou ${coins} coins e ${xp} XP`);

} });

client.on(Events.InteractionCreate, async interaction => { if (!interaction.isButton()) return;

if (interaction.customId === "loja") { const embed = new EmbedBuilder() .setTitle("Loja ORG TK") .setDescription("Escolha um item abaixo");

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("vip7").setLabel("VIP 7D").setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId("vip30").setLabel("VIP 30D").setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId("mira").setLabel("CG Mira abusiva").setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId("rei").setLabel("CG Rei da TK").setStyle(ButtonStyle.Primary)
);

interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

}

const canal = client.channels.cache.get(canalLogs);

if (interaction.customId === "vip7") { await db.set(vip_${interaction.user.id}, Date.now() + 7 * 24 * 60 * 60 * 1000); canal?.send(💰 ${interaction.user.tag} comprou VIP 7D); interaction.reply({ content: "VIP 7D comprado", ephemeral: true }); }

if (interaction.customId === "vip30") { await db.set(vip_${interaction.user.id}, Date.now() + 30 * 24 * 60 * 60 * 1000); canal?.send(💰 ${interaction.user.tag} comprou VIP 30D); interaction.reply({ content: "VIP 30D comprado", ephemeral: true }); }

if (interaction.customId === "mira") { await db.push(inv_${interaction.user.id}, "Mira abusiva"); canal?.send(💰 ${interaction.user.tag} comprou Mira abusiva); interaction.reply({ content: "Item enviado ao inventário", ephemeral: true }); }

if (interaction.customId === "rei") { await db.push(inv_${interaction.user.id}, "Rei da TK"); canal?.send(💰 ${interaction.user.tag} comprou Rei da TK); interaction.reply({ content: "Item enviado ao inventário", ephemeral: true }); }

if (interaction.customId === "caixa") { const sorte = Math.random() * 100; let premio = "Nada";

if (sorte <= 50) premio = "300 XP";
else if (sorte <= 75) premio = "600 XP";
else if (sorte <= 85) premio = "100 Dimas";
else if (sorte <= 90) premio = "Passe Booya";
else if (sorte <= 91) premio = "Sala paga";

canal?.send(`🎁 ${interaction.user.tag} abriu caixa e ganhou ${premio}`);

interaction.reply({ content: `Você ganhou ${premio}`, ephemeral: true });

} });

client.login(process.env.TOKEN);
