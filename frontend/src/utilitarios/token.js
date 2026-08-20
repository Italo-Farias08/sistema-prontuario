const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64UrlParaJson(base64Url) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  let bits = "";
  for (const char of base64) {
    const valor = BASE64_CHARS.indexOf(char);
    if (valor === -1) continue;
    bits += valor.toString(2).padStart(6, "0");
  }

  let texto = "";
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    texto += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2));
  }

  return decodeURIComponent(
    texto
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function decodificarToken(token) {
  try {
    const partes = token.split(".");
    if (partes.length !== 3) return null;
    return JSON.parse(base64UrlParaJson(partes[1]));
  } catch {
    return null;
  }
}

export function tokenExpirado(token) {
  const payload = decodificarToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}