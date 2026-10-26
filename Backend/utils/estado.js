// Máquina de estados
const TRANSICIONES = {
  Draft: { Submitted: ["autor", "admin"] },
  Submitted: { UnderReview: ["admin"] },
  UnderReview: { Approved: ["admin"], Rejected: ["admin"] },
  Approved: {},
  Rejected: {},
};

function transicionValida(desde, hacia) {
  return Boolean(TRANSICIONES[desde] && TRANSICIONES[desde][hacia]);
}

function rolesPermitidos(desde, hacia) {
  return (TRANSICIONES[desde] && TRANSICIONES[desde][hacia]) || [];
}

function transicionesDisponibles(estadoActual, esAutor, esAdmin) {
  const destinos = TRANSICIONES[estadoActual] || {};
  return Object.keys(destinos).filter((hacia) => {
    const roles = destinos[hacia];
    return (esAutor && roles.includes("autor")) || (esAdmin && roles.includes("admin"));
  });
}

module.exports = { TRANSICIONES, transicionValida, rolesPermitidos, transicionesDisponibles };