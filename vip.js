import { db } from "./database.js";

export async function checarVIP(user, vipId) {
  const perfil = await db.get(user);
  if (!perfil || !perfil.vipExpire) return false;

  if (Date.now() > perfil.vipExpire) {
    // remover cargo
    perfil.vipExpire = null;
    await db.set(user, perfil);
    return false;
  }

  return true;
}
