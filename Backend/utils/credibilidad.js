// Lógica pura del algoritmo de credibilidad 
function calcularComplejidad(coartada) {
  const cantidadDetalles = coartada.detalles.length;

  if (cantidadDetalles >= 10) return 20;
  if (cantidadDetalles >= 5) return 10;
  if (cantidadDetalles >= 3) return 5;
  return 0;
}

function calcularPromedioVotos(coartada) {
  if (coartada.votos.length === 0) return 0;

  let sumaPromedios = 0;
  coartada.votos.forEach((voto) => {
    sumaPromedios += (voto.credibilidad + voto.creatividad + voto.consistencia) / 3;
  });

  return sumaPromedios / coartada.votos.length;
}

// Credibility Index = (promedio * 10) + (testigos * 2) + complejidad
function calcularIndiceCredibilidad(coartada) {
  const promedio = calcularPromedioVotos(coartada);
  const puntosPorTestigos = coartada.testigos.length * 2;
  const complejidad = calcularComplejidad(coartada);

  const indice = promedio * 10 + puntosPorTestigos + complejidad;

  return Math.round(indice * 10) / 10;
}

module.exports = { calcularComplejidad, calcularPromedioVotos, calcularIndiceCredibilidad };