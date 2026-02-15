import { EmbedBuilder } from "discord.js";
import { db } from "./database.js";
import { config } from "./config.json" assert { type: "json" };
import ms from "ms";

// Função para pegar a liga do usuário
function pegarLiga(perfil) {
  if (!perfil) return null;
  const { bronze, prata, gold } = config.ligaIds;

  if (perfil.liga === "gold") return gold;
  if (perfil.liga === "prata") return prata;
  return bronze;
}

// Função para verificar VIP
function vipTexto(perfil) {
  if (!perfil || !perfil.vipExpire) return "Nenhum VIP";
  const tempo = perfil.vipExpire - Date.now();
  if (tempo <= 0) return "VIP expirado";
  return `VIP ativo - expira em ${ms(tempo, { long: true })}`;
}

export async function abrirPerfil(interaction) {
  const user = interaction.user.id;
  let perfil = await db.get(user) || { moedas: 0, xp: 0, liga: "bronze" };

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
