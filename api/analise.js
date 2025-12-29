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
    quadril,
    atividade
  } = req.body || {};

  if (!sexo || !idade || !peso || !altura || !cintura || !pescoco) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  // 🔹 TMB
  const tmb =
    sexo === "masculino"
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161;

  // 🔹 Gordura corporal (US Navy)
  let gordura;

  if (sexo === "masculino") {
    gordura =
      86.01 * Math.log10(cintura - pescoco) -
      70.041 * Math.log10(altura) +
      36.76;
  } else {
    gordura =
      163.205 * Math.log10(cintura + quadril - pescoco) -
      97.684 * Math.log10(altura) -
      78.387;
  }

  gordura = Number(gordura.toFixed(1));

  // 🔹 Classificação
  let classificacao;

  if (sexo === "masculino") {
    classificacao =
      gordura < 12 ? "Atleta" :
      gordura < 18 ? "Adequado" :
      gordura < 25 ? "Moderado" :
      "Elevado";
  } else {
    classificacao =
      gordura < 18 ? "Atleta" :
      gordura < 25 ? "Adequado" :
      gordura < 32 ? "Moderado" :
      "Elevado";
  }

  // 🔹 Gasto diário
  const fatores = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    alto: 1.725
  };

  const gastoDiario = Math.round(tmb * (fatores[atividade] || 1.2));

  // 🔹 Recomendação
  let recomendacao;

  if (classificacao === "Atleta") {
    recomendacao = "Manter estratégia focada em performance e recuperação.";
  } else if (classificacao === "Adequado") {
    recomendacao = "Foco em recomposição corporal com leve ajuste calórico.";
  } else if (classificacao === "Moderado") {
    recomendacao = "Redução gradual de gordura preservando massa magra.";
  } else {
    recomendacao = "Prioridade em redução de gordura com estratégia estruturada.";
  }

  return res.status(200).json({
    tmb: Math.round(tmb),
    gorduraCorporal: gordura,
    classificacao,
    gastoDiario,
    recomendacao
  });
}
