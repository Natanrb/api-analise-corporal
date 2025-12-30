export default function handler(req, res) {
  // ===============================
  // CORS
  // ===============================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // ===============================
  // Normalização de entrada
  // ===============================
  let {
    sexo,
    idade,
    peso,
    altura,
    cintura,
    pescoco,
    quadril,
    atividade
  } = req.body || {};

  // Converter strings com vírgula
  const n = (v) =>
    typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);

  idade = n(idade);
  peso = n(peso);
  altura = n(altura);
  cintura = n(cintura);
  pescoco = n(pescoco);
  quadril = n(quadril);

  // ===============================
  // Validações
  // ===============================
  if (!sexo || !idade || !peso || !altura || !cintura || !pescoco) {
    return res.status(400).json({ error: "Dados incompletos ou inválidos" });
  }

  if (sexo === "feminino" && !quadril) {
    return res.status(400).json({ error: "Quadril é obrigatório para mulheres" });
  }

  if (sexo === "masculino" && cintura <= pescoco) {
    return res.status(400).json({ error: "Cintura deve ser maior que o pescoço" });
  }

  if (sexo === "feminino" && cintura + quadril <= pescoco) {
    return res.status(400).json({ error: "Medidas corporais inconsistentes" });
  }

  // ===============================
  // Conversão CM → POLEGADAS (US Navy original)
  // ===============================
  const cmToIn = (v) => v / 2.54;

  const alturaIn = cmToIn(altura);
  const cinturaIn = cmToIn(cintura);
  const pescocoIn = cmToIn(pescoco);
  const quadrilIn = cmToIn(quadril);

  // ===============================
  // TMB (Mifflin-St Jeor)
  // ===============================
  const tmb =
    sexo === "masculino"
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161;

  // ===============================
  // Gordura corporal (US Navy – POLEGADAS)
  // ===============================
  let gordura;

  if (sexo === "masculino") {
    gordura =
      86.01 * Math.log10(cinturaIn - pescocoIn) -
      70.041 * Math.log10(alturaIn) +
      36.76;
  } else {
    gordura =
      163.205 * Math.log10(cinturaIn + quadrilIn - pescocoIn) -
      97.684 * Math.log10(alturaIn) -
      78.387;
  }

  gordura = Number(gordura.toFixed(1));

  // ===============================
  // Classificação
  // ===============================
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

  // ===============================
  // Gasto diário (TDEE)
  // ===============================
  const fatores = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    alto: 1.725
  };

  const gastoDiario = Math.round(
    tmb * (fatores[atividade] || 1.2)
  );

  // ===============================
  // Recomendação (linguagem consultoria)
  // ===============================
  let recomendacao;

  if (classificacao === "Atleta") {
    recomendacao =
      "De acordo com a análise realizada, a recomendação é manter o protocolo atual, com foco em performance, recuperação e otimização dos resultados.";
  } else if (classificacao === "Adequado") {
    recomendacao =
      "Com base na análise, a indicação é manter o equilíbrio corporal, priorizando a recomposição física e ajustes sutis na ingestão calórica para otimizar a composição corporal.";
  } else if (classificacao === "Moderado") {
    recomendacao =
      "Segundo a análise, recomenda-se iniciar um processo gradual de redução de gordura, preservando a massa magra e promovendo hábitos consistentes de alimentação e treino.";
  } else {
    recomendacao =
      "Conforme a análise realizada, a recomendação é focar na redução de gordura corporal por meio de uma estratégia estruturada, com acompanhamento nutricional e de treinamento adequados.";
  }



  // ===============================
  // Resposta final
  // ===============================
  return res.status(200).json({
    tmb: Math.round(tmb),
    gorduraCorporal: gordura,
    classificacao,
    gastoDiario,
    recomendacao
  });
}
