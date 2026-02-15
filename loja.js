import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { db } from "./database.js";

export const LOJA = {
  vip7: { nome: "VIP 7 Dias", preco: 10, cargo: "1472452088834424994", dias: 7 },
  vip30: { nome: "VIP 30 Dias", preco: 40, cargo: "1472452205972947095", dias: 30 },
  mira: { nome: "Mira Abusiva", preco: 45, cargo: "1472452374059684016" },
  rei: { nome: "Rei da TK", preco: 25, cargo: "1472452481845035102" }
};

export async function abrirLoja(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("🛒 LOJA ORG TK")
    .setDescription("Compre cargos exclusivos!\nEscolha abaixo:")
    .setColor("Gold");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("vip7").setLabel("VIP 7D - 10 moedas").setStyle(2),
    new ButtonBuilder().setCustomId("vip30").setLabel("VIP 30D - 40 moedas").setStyle(2),
    new ButtonBuilder().setCustomId("mira").setLabel("Mira - 45 moedas").setStyle(2),
    new ButtonBuilder().setCustomId("rei").setLabel("Rei - 25 moedas").setStyle(2)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

export async function comprar(interaction) {
  const item = LOJA[interaction.customId];
  if (!item) return;

  const user = interaction.user.id;
  let perfil = await db.get(user) || { moedas: 0, xp: 0 };

  if (perfil.moedas < item.preco)
    return interaction.reply({ content: "❌ Você não tem moedas!", ephemeral: true });

  perfil.moedas -= item.preco;
  await db.set(user, perfil);

  // Dar cargo
  const membro = await interaction.guild.members.fetch(user);
  if (item.cargo) await membro.roles.add(item.cargo);

  // Se for VIP com dias, salvar expiração
  if (item.dias) {
    const expire = Date.now() + item.dias * 24 * 60 * 60 * 1000;
    perfil.vipExpire = expire;
    await db.set(user, perfil);
  }

  interaction.reply({ content: `✅ Você comprou ${item.nome}!`, ephemeral: true });
      }
