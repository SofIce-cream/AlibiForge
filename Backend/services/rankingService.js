const Coartada = require("../models/Coartada");
const { calcularIndiceCredibilidad } = require("./coartadaService");

// Master of Deceit: mayor índice de credibilidad
function masterDeceit(coartadas) {
  const datos = coartadas.map((coartada) => ({
    autor: coartada.autor.alias,
    puntos: calcularIndiceCredibilidad(coartada),
  }));
  return datos.sort((a, b) => b.puntos - a.puntos);
}

function calcularPromedioCreatividad(coartada) {
  if (coartada.votos.length === 0) return 0;
  let suma = 0;
  coartada.votos.forEach((voto) => {
    suma += voto.creatividad;
  });
  return suma / coartada.votos.length;
}

// Most Creative: mayor promedio de creatividad
function mostCreative(coartadas) {
  const datos = coartadas.map((coartada) => ({
    autor: coartada.autor.alias,
    puntos: calcularPromedioCreatividad(coartada),
  }));
  return datos.sort((a, b) => b.puntos - a.puntos);
}

function calcularPromedioConsistencia(coartada) {
  if (coartada.votos.length === 0) return 0;
  let suma = 0;
  coartada.votos.forEach((voto) => {
    suma += voto.consistencia;
  });
  return suma / coartada.votos.length;
}

// Most Consistent: mayor promedio de consistencia
function mostConsistent(coartadas) {
  const datos = coartadas.map((coartada) => ({
    autor: coartada.autor.alias,
    puntos: calcularPromedioConsistencia(coartada),
  }));
  return datos.sort((a, b) => b.puntos - a.puntos);
}

// Most Wanted: más coartadas creadas
function mostWanted(coartadas) {
  const cantidades = {};
  coartadas.forEach((coartada) => {
    const alias = coartada.autor.alias;
    cantidades[alias] = (cantidades[alias] || 0) + 1;
  });

  const datos = Object.keys(cantidades).map((autor) => ({
    autor,
    puntos: cantidades[autor],
  }));
  return datos.sort((a, b) => b.puntos - a.puntos);
}

async function calcularRankings() {
  const coartadas = await Coartada.find().populate("autor", "alias");

  return {
    masterDeceit: masterDeceit(coartadas),
    mostCreative: mostCreative(coartadas),
    mostConsistent: mostConsistent(coartadas),
    mostWanted: mostWanted(coartadas),
  };
}

module.exports = { calcularRankings };