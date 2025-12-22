export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { sexo, peso, altura, idade, cintura, pescoco, quadril, atividade } = req.body;

  const tmb =
    sexo === "masculino"
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161;

  const fatores = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    alto: 1.725,
  };

  const gastoDiario = Math.round(tmb * (fatores[atividade] || 1.2));

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

  return res.status(200).json({
    tmb: Math.round(tmb),
    gastoDiario,
    gorduraCorporal: gordura,
    classificacao:
      gordura < 18 ? "Baixa gordura" : gordura < 25 ? "Moderada" : "Elevada",
    recomendacao: "Plano personalizado recomendado",
  });
}
