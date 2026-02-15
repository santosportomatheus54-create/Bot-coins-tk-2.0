import fs from "fs";
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from "discord.js";
import { db } from "./database.js";
import { abrirLoja, comprar } from "./loja.js";
import { usarSorte } from "./sorte.js";
import { abrirPerfil } from "./inventario.js";

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Registrar slash commands
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

  // Comando slash
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: true });

    if (interaction.commandName === "painelmoeda") {
      await abrirLoja(interaction);
    } else if (interaction.commandName === "perfil") {
      await abrirPerfil(interaction);
    }
  }

  // Botões
  if (interaction.isButton()) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.user.id;

    // Sorte
    if (interaction.customId === "sorte") {
      await usarSorte(user);
      return interaction.editReply("🎁 Você usou a sorte!");
    }

    // Loja
    await comprar(interaction);
  }
});

await client.login(config.token);
