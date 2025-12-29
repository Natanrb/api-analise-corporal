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
      86.01 * Math.log10((cintura - pescoco)/2.54) -
      70.041 * Math.log10(altura/2.54) + 36.76;
  } else {
    gordura =
      163.205 * Math.log10((cintura + quadril - pescoco)/2.54) -
      97.684 * Math.log10(altura/2.54) - 78.387;
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
  recomendacao = "De acordo com a análise realizada, a recomendação é manter o protocolo atual, com foco em performance, recuperação e otimização dos resultados.";
} else if (classificacao === "Adequado") {
  recomendacao = "Com base na análise, a indicação é manter o equilíbrio corporal, priorizando a recomposição física e ajustes sutis na ingestão calórica para otimizar a composição corporal.";
} else if (classificacao === "Moderado") {
  recomendacao = "Segundo a análise, recomenda-se iniciar um processo gradual de redução de gordura, preservando a massa magra e promovendo hábitos consistentes de alimentação e treino.";
} else {
  recomendacao = "Conforme a análise realizada, a recomendação é focar na redução de gordura corporal por meio de uma estratégia estruturada, com acompanhamento nutricional e de treinamento adequados.";
}


  return res.status(200).json({
    tmb: Math.round(tmb),
    gorduraCorporal: gordura,
    classificacao,
    gastoDiario,
    recomendacao
  });
}
