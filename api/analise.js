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

  const {
    sexo,
    idade,
    peso,
    altura,
    cintura,
    pescoco,
    quadril
  } = req.body || {};

  // Validação básica
  if (!sexo || !idade || !peso || !altura || !cintura || !pescoco) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  // 🔹 TMB (Mifflin-St Jeor)
  const tmb =
    sexo === "masculino"
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161;

  // 🔹 Bioimpedância (US Navy)
  let gordura;

  if (sexo === "masculino") {
    if (cintura <= pescoco) {
      return res.status(400).json({
        error: "Cintura deve ser maior que o pescoço"
      });
    }

    gordura =
      86.01 * Math.log10(cintura - pescoco) -
      70.041 * Math.log10(altura) +
      36.76;
  } else {
    if (!quadril || cintura + quadril <= pescoco) {
      return res.status(400).json({
        error: "Quadril inválido"
      });
    }

    gordura =
      163.205 * Math.log10(cintura + quadril - pescoco) -
      97.684 * Math.log10(altura) -
      78.387;
  }

  gordura = Number(gordura.toFixed(1));

  return res.status(200).json({
    tmb: Math.round(tmb),
    gorduraCorporal: gordura,
    mensagem: "Análise corporal calculada com sucesso"
  });
}
