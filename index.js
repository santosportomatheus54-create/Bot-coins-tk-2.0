import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.json" assert { type: "json" };
import { abrirLoja, comprar } from "./loja.js";
import { usarSorte } from "./sorte.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once("ready", () => {
  console.log(`Bot online! ${client.user.tag}`);
});

// Slash command exemplo
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "painelmoeda") {
      await abrirLoja(interaction);
    }
  }

  if (interaction.isButton()) {
    await comprar(interaction);
  }
});

await client.login(config.token);
