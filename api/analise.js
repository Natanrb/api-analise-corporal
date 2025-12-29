export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { sexo, idade, peso, altura } = req.body;

  const tmb =
    sexo === "masculino"
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161;

  return res.status(200).json({
    tmb: Math.round(tmb),
    mensagem: "API funcionando do zero",
  });
}
