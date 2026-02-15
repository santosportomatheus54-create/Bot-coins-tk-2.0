import { db } from "./database.js";

export async function usarSorte(user) {
  let perfil = await db.get(user) || { moedas: 0, xp: 0 };
  const rand = Math.random() * 100;

  if (rand <= 3) perfil.moedas += 200;
  else if (rand <= 13) perfil.moedas += 100;
  else if (rand <= 43) perfil.xp += 400;
  else perfil.xp += 200;

  await db.set(user, perfil);
  return perfil;
}
