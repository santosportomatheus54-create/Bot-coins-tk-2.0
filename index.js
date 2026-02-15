import { Client, GatewayIntentBits, SlashCommandBuilder, Routes } from "discord.js";
import { config } from "./config.json" assert { type: "json" };
import { abrirLoja, comprar } from "./loja.js";
import { usarSorte } from "./sorte.js";
import { abrirPerfil } from "./inventario.js";
import { REST } from "@discordjs/rest";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once("ready", async () => {
  console.log(`Bot online! ${client.user.tag}`);

  // Registrar slash commands
  const commands = [
    new SlashCommandBuilder().setName("painelmoeda").setDescription("Abre o painel da loja"),
    new SlashCommandBuilder().setName("perfil").setDescription("Mostra seu perfil")
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(config.token);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "painelmoeda") {
      await abrirLoja(interaction);
    } else if (interaction.commandName === "perfil") {
      await abrirPerfil(interaction);
    }
  }

  if (interaction.isButton()) {
    await comprar(interaction);
  }
});

await client.login(config.token);
