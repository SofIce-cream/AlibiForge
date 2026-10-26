const Coartada = require("../models/Coartada");
const { calcularIndiceCredibilidad } = require("../utils/credibilidad");

// Rankings por AUTOR. Los promedios solo cuentan coartadas públicas
// (no borradores ni rechazadas) con votos.
const redondear = (n) => Math.round(n * 100) / 100;

function agruparPorAutor(coartadas) {
  const autores = {};
  coartadas.forEach((coartada) => {
    if (!coartada.autor) return;
    const alias = coartada.autor.alias;
    if (!autores[alias]) autores[alias] = [];
    autores[alias].push(coartada);
  });
  return autores;
}

function promedioPorAutor(coartadas, calcular) {
  const porAutor = agruparPorAutor(coartadas);
  const datos = Object.keys(porAutor).map((autor) => {
    const valores = porAutor[autor].map(calcular);
    const suma = valores.reduce((acc, v) => acc + v, 0);
    return { autor, puntos: redondear(suma / valores.length), coartadas: valores.length };
  });
  return datos.sort((a, b) => b.puntos - a.puntos);
}

function promedioCampo(coartada, campo) {
  let suma = 0;
  coartada.votos.forEach((voto) => {
    suma += voto[campo];
  });
  return suma / coartada.votos.length;
}

function masterDeceit(coartadasConVotos) {
  return promedioPorAutor(coartadasConVotos, calcularIndiceCredibilidad);
}

function mostCreative(coartadasConVotos) {
  return promedioPorAutor(coartadasConVotos, (c) => promedioCampo(c, "creatividad"));
}

function mostConsistent(coartadasConVotos) {
  return promedioPorAutor(coartadasConVotos, (c) => promedioCampo(c, "consistencia"));
}

function mostWanted(coartadas) {
  const porAutor = agruparPorAutor(coartadas);
  const datos = Object.keys(porAutor).map((autor) => ({
    autor,
    puntos: porAutor[autor].length,
  }));
  return datos.sort((a, b) => b.puntos - a.puntos);
}

async function calcularRankings() {
  const coartadas = await Coartada.find().populate("autor", "alias");

  const conVotos = coartadas.filter(
    (c) => c.votos.length > 0 && c.estado !== "Draft" && c.estado !== "Rejected",
  );

  return {
    masterDeceit: masterDeceit(conVotos),
    mostCreative: mostCreative(conVotos),
    mostConsistent: mostConsistent(conVotos),
    mostWanted: mostWanted(coartadas),
  };
}

module.exports = { calcularRankings };