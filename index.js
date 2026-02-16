import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes, Events } from "discord.js";
import { QuickDB } from "quick.db";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const db = new QuickDB();

const LEVEL_XP = 100;
const TEMPORADA = "s1";

const cargosXP = {
  5: "ID_CARGO_5",
  10: "ID_CARGO_10",
  20: "ID_CARGO_20"
};

const commands = [
  new SlashCommandBuilder().setName("painel").setDescription("Abrir painel"),
  new SlashCommandBuilder().setName("partida").setDescription("Finalizar partida")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
})();

async function addCoins(user, coins) {
  const atual = await db.get(`${TEMPORADA}_coins_${user}`) || 0;
  await db.set(`${TEMPORADA}_coins_${user}`, atual + coins);
}

async function addXP(user, guild, xp) {
  let xpAtual = await db.get(`${TEMPORADA}_xp_${user}`) || 0;
  let level = await db.get(`${TEMPORADA}_level_${user}`) || 1;

  xpAtual += xp;

  if (xpAtual >= LEVEL_XP * level) {
    xpAtual = 0;
    level++;

    await db.set(`${TEMPORADA}_level_${user}`, level);

    if (cargosXP[level]) {
      const membro = await guild.members.fetch(user);
      membro.roles.add(cargosXP[level]).catch(() => {});
    }
  }

  await db.set(`${TEMPORADA}_xp_${user}`, xpAtual);
}

async function addVIP(user, dias) {
  const tempo = Date.now() + dias * 86400000;
  await db.set(`vip_${user}`, tempo);
}

setInterval(async () => {
  const all = await db.all();
  for (const d of all) {
    if (d.id.startsWith("vip_")) {
      if (Date.now() > d.value) await db.delete(d.id);
    }
  }
}, 60000);

function ganhoCoins() { return Math.floor(Math.random() * 10) + 1; }
function ganhoXP() { return Math.floor(Math.random() * 20) + 20; }

client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "partida") {
      const coins = ganhoCoins();
      const xp = ganhoXP();

      await addCoins(interaction.user.id, coins);
      await addXP(interaction.user.id, interaction.guild, xp);

      return interaction.reply({ content: `XP: ${xp} | Coins: ${coins}`, ephemeral: true });
    }

    if (interaction.commandName === "painel") {
      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("ORG TK")
        .setDescription("Clique abaixo");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("perfil").setLabel("Perfil").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("rank").setLabel("Ranking").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("loja").setLabel("Loja").setStyle(ButtonStyle.Secondary)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }
  }

  if (interaction.isButton()) {

    if (interaction.customId === "perfil") {
      const xp = await db.get(`${TEMPORADA}_xp_${interaction.user.id}`) || 0;
      const coins = await db.get(`${TEMPORADA}_coins_${interaction.user.id}`) || 0;
      const level = await db.get(`${TEMPORADA}_level_${interaction.user.id}`) || 1;

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("Perfil")
        .setDescription(`Level: ${level}\nXP: ${xp}\nCoins: ${coins}`);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId === "rank") {
      let data = await db.all();

      data = data
        .filter(x => x.id.startsWith(`${TEMPORADA}_level_`))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      let desc = "";

      for (let i = 0; i < data.length; i++) {
        const id = data[i].id.split("_")[2];
        desc += `${i + 1}. <@${id}> - Level ${data[i].value}\n`;
      }

      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("Ranking semanal")
        .setDescription(desc || "Sem dados");

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId === "loja") {
      const embed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle("Loja VIP");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("vip7").setLabel("VIP 7 dias").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("vip30").setLabel("VIP 30 dias").setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    if (interaction.customId === "vip7" || interaction.customId === "vip30") {
      const preco = interaction.customId === "vip7" ? 100 : 300;
      const dias = interaction.customId === "vip7" ? 7 : 30;

      const coins = await db.get(`${TEMPORADA}_coins_${interaction.user.id}`) || 0;

      if (coins < preco) return interaction.reply({ content: "Sem coins", ephemeral: true });

      await db.set(`${TEMPORADA}_coins_${interaction.user.id}`, coins - preco);

      await addVIP(interaction.user.id, dias);

      return interaction.reply({ content: `VIP ativado por ${dias} dias`, ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
