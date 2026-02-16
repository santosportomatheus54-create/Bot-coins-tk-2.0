import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes, Events } from "discord.js"; import { QuickDB } from "quick.db"; import fs from "fs";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] }); const db = new QuickDB();

const logs = "1471187137595441152";

const comandos = [ new SlashCommandBuilder().setName("painel").setDescription("Abrir"), new SlashCommandBuilder().setName("partida").setDescription("Recompensa") ].map(x => x.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => { await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: comandos }); })();

setInterval(async () => { try { const data = await db.all(); fs.writeFileSync("backup.json", JSON.stringify(data, null, 2)); } catch {} }, 600000);

(async () => { if (fs.existsSync("backup.json")) { const data = JSON.parse(fs.readFileSync("backup.json")); for (const i of data) await db.set(i.id, i.value); } })();

client.on(Events.InteractionCreate, async i => { if (!i.isChatInputCommand()) return;

if (i.commandName === "painel") { const e = new EmbedBuilder() .setTitle("ORG TK 💰") .setDescription("Vem farmar 🔥");

const r = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("perfil").setLabel("Perfil").setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId("ranking").setLabel("Ranking").setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId("loja").setLabel("Loja").setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId("inventario").setLabel("Inventário").setStyle(ButtonStyle.Secondary)
);

i.reply({ embeds: [e], components: [r] });

}

if (i.commandName === "partida") { const coins = Math.floor(Math.random() * 10) + 1; const xp = Math.floor(Math.random() * 50) + 10;

await db.add(`coins_${i.user.id}`, coins);
await db.add(`xp_${i.user.id}`, xp);

i.reply(`+${coins} coins | +${xp} XP`);

} });

client.on(Events.InteractionCreate, async i => { if (!i.isButton()) return;

const canal = client.channels.cache.get(logs);

if (i.customId === "loja") { const e = new EmbedBuilder() .setTitle("Loja") .setDescription( "VIP 7D - 10 coins\n" + "VIP 30D - 50 coins\n" + "CG Mira abusiva - 45 coins\n" + "CG Rei da TK - 45 coins" );

const r1 = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("vip7").setLabel("VIP 7D").setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId("vip30").setLabel("VIP 30D").setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId("mira").setLabel("CG Mira abusiva").setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId("rei").setLabel("CG Rei da TK").setStyle(ButtonStyle.Primary)
);

const r2 = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("caixa").setLabel("Caixa misteriosa").setStyle(ButtonStyle.Secondary)
);

i.reply({ embeds: [e], components: [r1, r2], ephemeral: true });

}

if (i.customId === "vip7") { await db.set(vip_${i.user.id}, Date.now() + 604800000); canal?.send(💰 ${i.user.tag} comprou VIP 7D); i.reply({ content: "Comprado", ephemeral: true }); }

if (i.customId === "vip30") { await db.set(vip_${i.user.id}, Date.now() + 2592000000); canal?.send(💰 ${i.user.tag} comprou VIP 30D); i.reply({ content: "Comprado", ephemeral: true }); }

if (i.customId === "mira") { await db.push(inv_${i.user.id}, "Mira abusiva"); canal?.send(💰 ${i.user.tag} comprou CG Mira abusiva); i.reply({ content: "Inventário", ephemeral: true }); }

if (i.customId === "rei") { await db.push(inv_${i.user.id}, "Rei da TK"); canal?.send(💰 ${i.user.tag} comprou CG Rei da TK); i.reply({ content: "Inventário", ephemeral: true }); }

if (i.customId === "caixa") { const s = Math.random() * 100; let premio = "Nada";

if (s <= 50) {
  premio = "300 XP";
  await db.add(`xp_${i.user.id}`, 300);
} else if (s <= 75) {
  premio = "600 XP";
  await db.add(`xp_${i.user.id}`, 600);
} else if (s <= 85) {
  premio = "100 Dimas";
  await db.add(`coins_${i.user.id}`, 100);
} else if (s <= 90) {
  premio = "Passe Booya";
  await db.push(`inv_${i.user.id}`, "Passe Booya");
} else if (s <= 91) {
  premio = "Sala paga";
  await db.push(`inv_${i.user.id}`, "Sala paga");
}

canal?.send(`🎁 ${i.user.tag} abriu caixa e ganhou ${premio}`);

i.reply({ content: premio, ephemeral: true });

}

if (i.customId === "inventario") { const inv = await db.get(inv_${i.user.id}) || [];

const e = new EmbedBuilder()
  .setTitle("Inventário")
  .setDescription(inv.length ? inv.join("\n") : "Vazio");

i.reply({ embeds: [e], ephemeral: true });

} });

client.login(process.env.TOKEN);
