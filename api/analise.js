export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { sexo, idade, peso, altura } = req.body || {};

  if (!sexo || !idade || !peso || !altura) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const tmb =
    sexo === "masculino"
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161;

  return res.status(200).json({
    tmb: Math.round(tmb),
    mensagem: "TMB calculada com sucesso",
  });
}
