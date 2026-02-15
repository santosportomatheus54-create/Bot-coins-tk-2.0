import fs from "fs";
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import QuickDB from "quick.db";

// Ler config.json
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

// Iniciar DB
const db = new QuickDB();

// Loja
const LOJA = {
  vip7: { nome: "VIP 7 Dias", preco: 10, cargo: config.vipIds.vip7, dias: 7 },
  vip30: { nome: "VIP 30 Dias", preco: 40, cargo: config.vipIds.vip30, dias: 30 },
  mira: { nome: "Mira Abusiva", preco: 45, cargo: config.vipIds.mira },
  rei: { nome: "Rei da TK", preco: 25, cargo: config.vipIds.rei }
};

// Cliente
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Função: abrir loja
async function abrirLoja(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("🛒 LOJA ORG TK")
    .setDescription("Compre cargos e VIPs com suas moedas!")
    .setColor("Gold");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("vip7").setLabel("VIP 7D - 10 moedas").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("vip30").setLabel("VIP 30D - 40 moedas").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("mira").setLabel("Mira - 45 moedas").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("rei").setLabel("Rei - 25 moedas").setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

// Função: comprar item
async function comprar(interaction) {
  const item = LOJA[interaction.customId];
  if (!item) return;

  const user = interaction.user.id;
  let perfil = await db.get(user) || { moedas: 0, xp: 0 };

  if (perfil.moedas < item.preco)
    return interaction.reply({ content: "❌ Você não tem moedas suficientes!", ephemeral: true });

  perfil.moedas -= item.preco;

  // VIP com expiração
  if (item.dias) {
    const expire = Date.now() + item.dias * 24 * 60 * 60 * 1000;
    perfil.vipExpire = expire;
  }

  await db.set(user, perfil);

  // Dar cargo no servidor
  const membro = await interaction.guild.members.fetch(user);
  if (item.cargo) await membro.roles.add(item.cargo);

  interaction.reply({ content: `✅ Você comprou ${item.nome}!`, ephemeral: true });
}

// Função: usar sorte
async function usarSorte(user) {
  let perfil = await db.get(user) || { moedas: 0, xp: 0 };
  const rand = Math.random() * 100;

  if (rand <= 3) perfil.moedas += 200;
  else if (rand <= 13) perfil.moedas += 100;
  else if (rand <= 43) perfil.xp += 400;
  else perfil.xp += 200;

  await db.set(user, perfil);
  return perfil;
}

// Função: abrir perfil
function pegarLiga(perfil) {
  if (!perfil) return null;
  const { bronze, prata, gold } = config.ligaIds;

  if (perfil.xp >= 2000) return gold;
  if (perfil.xp >= 1000) return prata;
  return bronze;
}

function vipTexto(perfil) {
  if (!perfil || !perfil.vipExpire) return "Nenhum VIP";
  const tempo = perfil.vipExpire - Date.now();
  if (tempo <= 0) return "VIP expirado";
  return `VIP ativo - expira em ${Math.floor(tempo / 1000 / 60 / 60)}h`;
}

async function abrirPerfil(interaction) {
  const user = interaction.user.id;
  let perfil = await db.get(user) || { moedas: 0, xp: 0 };

  const embed = new EmbedBuilder()
    .setTitle(`💠 Perfil de ${interaction.user.username}`)
    .setColor("Blue")
    .setThumbnail(config.embedImage)
    .addFields(
      { name: "💰 Moedas", value: `${perfil.moedas}`, inline: true },
      { name: "⭐ XP", value: `${perfil.xp}`, inline: true },
      { name: "🏆 Liga", value: `<@&${pegarLiga(perfil)}>`, inline: true },
      { name: "🎖 VIP", value: vipTexto(perfil), inline: true }
    )
    .setFooter({ text: "ORG TK • Divirta-se farmando!" });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Registrar comandos
client.once("ready", async () => {
  console.log(`Bot online: ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder().setName("painelmoeda").setDescription("Abre o painel da loja"),
    new SlashCommandBuilder().setName("perfil").setDescription("Mostra seu perfil")
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(config.token);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

// Interações
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: true });
    if (interaction.commandName === "painelmoeda") await abrirLoja(interaction);
    else if (interaction.commandName === "perfil") await abrirPerfil(interaction);
  }

  if (interaction.isButton()) {
    await interaction.deferReply({ ephemeral: true });
    await comprar(interaction);
  }
});

// Login
await client.login(config.token);u
