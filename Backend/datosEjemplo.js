// Crea datos de ejemplo (usuarios, situaciones, coartadas, votos y cadenas)
// SIN borrar nada. Se puede ejecutar varias veces: lo que ya existe se omite.
// Uso:  npm run datos:ejemplo
require("dotenv").config();
const mongoose = require("mongoose");

const Gremio = require("./models/Gremio");
const Usuario = require("./models/Usuario");
const Coartada = require("./models/Coartada");
const Situacion = require("./models/Situacion");

const PASSWORD = "HelloWorld*29"; 
const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000;

const gremiosData = [
  { nombre: "The Excuse Makers", descripcion: "Los que inventan la excusa más creativa." },
  { nombre: "The Detail Weavers", descripcion: "Tejen cada detalle hasta que nadie dude." },
  { nombre: "The Improvisers", descripcion: "Respuesta inmediata bajo presión." },
];

const usuariosData = [
  { alias: "ShadowHuntress", especialidad: "Excusa Creativa", g: 0 },
  { alias: "TomatoSoup", especialidad: "Excusa Creativa", g: 0 },
  { alias: "Urfear", especialidad: "Excusa Creativa", g: 0 },
  { alias: "Cowfarm", especialidad: "Excusa Creativa", g: 0 },
  { alias: "404error", especialidad: "Detallista", g: 1 },
  { alias: "PixelMonk", especialidad: "Detallista", g: 1 },
  { alias: "InkAndAlibi", especialidad: "Detallista", g: 1 },
  { alias: "LaCartógrafa", especialidad: "Detallista", g: 1 },
  { alias: "QuickFox", especialidad: "Improvisador", g: 2 },
  { alias: "LastMinute", especialidad: "Improvisador", g: 2 },
  { alias: "NoPlanB", especialidad: "Improvisador", g: 2 },
  { alias: "Wingman", especialidad: "Improvisador", g: 2 },
];

const situacionesData = [
  "Llegue tarde a un parcial",
  "Llegue tarde a un final",
  "Llegue tarde a un quiz",
  "Llegue tarde a clase",
  "Entregue un proyecto tarde",
  "No hice un proyecto",
  "No hice a tiempo mi parte de un trabajo",
  "Llegue tarde al trabajo",
  "No fui a una reunion",
  "Necesito salir de clase",
];

// 15 coartadas: 3 Draft, 4 Submitted, 5 Approved, 3 Rejected
// autor = índice en usuariosData, s = índice en situacionesData, nd = nº de detalles
const coartadasData = [
  { titulo: "El gato en el teclado", autor: 0, s: 5, estado: "Draft", nd: 3 },
  { titulo: "Apagón en mi cuadra", autor: 5, s: 3, estado: "Draft", nd: 5 },
  { titulo: "La alarma que no sonó", autor: 8, s: 0, estado: "Draft", nd: 3 },
  { titulo: "Llanta pinchada camino a la U", autor: 1, s: 0, estado: "Submitted", nd: 5 },
  { titulo: "El bus se varó en la autopista", autor: 4, s: 3, estado: "Submitted", nd: 10 },
  { titulo: "Cita médica de urgencia", autor: 9, s: 9, estado: "Submitted", nd: 3 },
  { titulo: "Se dañó el internet justo al entregar", autor: 6, s: 4, estado: "Submitted", nd: 5 },
  { titulo: "Inundación en el sótano", autor: 2, s: 1, estado: "Approved", nd: 10 },
  { titulo: "Mi abuela necesitaba ayuda", autor: 7, s: 8, estado: "Approved", nd: 5 },
  { titulo: "Cargador roto y laptop apagada", autor: 3, s: 5, estado: "Approved", nd: 5 },
  { titulo: "Trancón por marcha estudiantil", autor: 10, s: 7, estado: "Approved", nd: 10 },
  { titulo: "Intoxicación por empanada", autor: 11, s: 2, estado: "Approved", nd: 3 },
  // Rechazada y expuesta por 3 marcas falsas: su autor (Cowfarm) pierde 10 puntos y queda bloqueado
  { titulo: "Me secuestraron los alienígenas", autor: 3, s: 4, estado: "Rejected", nd: 3, expuesta: true },
  { titulo: "Perdí el celular y la memoria", autor: 8, s: 6, estado: "Rejected", nd: 3 },
  { titulo: "El perro se comió mi USB", autor: 5, s: 5, estado: "Rejected", nd: 5 },
];

// Cadenas de testigos: coartada -> usuarios (2 a 5 testigos)
const cadenasData = [
  { coartada: 7, testigos: [3, 4, 5, 8, 9] },
  { coartada: 10, testigos: [0, 1, 6, 7] },
  { coartada: 8, testigos: [1, 2, 11] },
  { coartada: 4, testigos: [2, 10, 9] },
  { coartada: 3, testigos: [5, 11] },
];

// 30 votos en las 12 coartadas que no son borrador
const votosPorCoartada = { 3: 3, 4: 3, 5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 3, 11: 2, 12: 2, 13: 2, 14: 2 };

const detallesBase = [
  "Hay una foto con la hora marcada",
  "Avisé por mensaje antes de la hora",
  "Un vecino lo presenció",
  "Tengo el recibo o comprobante",
  "Llamé a un familiar en ese momento",
  "Quedó registrado en una app",
  "El profesor ya sabía del problema",
  "Un compañero me vio llegar",
  "Hay una captura de pantalla",
  "Pasó cerca de un lugar conocido",
];

async function ejecutar() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Gremios
  const gremios = [];
  for (const g of gremiosData) {
    gremios.push((await Gremio.findOne({ nombre: g.nombre })) || (await Gremio.create(g)));
  }

  // Usuarios (+ admin)
  /*const usuarios = [];
  for (const u of usuariosData) {
    let doc = await Usuario.findOne({ alias: u.alias });
    if (!doc) {
      doc = new Usuario({
        alias: u.alias,   
        password: PASSWORD,
        especialidad: u.especialidad,
        gremio: gremios[u.g]._id,
      });
      await doc.save();
    }
    usuarios.push(doc);
  }
  let admin = await Usuario.findOne({ alias: "Director" });
  if (!admin) {
    admin = new Usuario({ alias: "Director", password: PASSWORD, especialidad: "Conspirador", role: "admin" });
    await admin.save();
  }*/ //Cambio temporal para poner la contraseña de todos los usuarios igual y que no se borre nada
  // Usuarios (+ admin) - FORZANDO ACTUALIZACIÓN DE CONTRASEÑA
  const usuarios = [];
  for (const u of usuariosData) {
    let doc = await Usuario.findOne({ alias: u.alias });
    if (!doc) {
      doc = new Usuario({
        alias: u.alias,
        password: PASSWORD,
        especialidad: u.especialidad,
        gremio: gremios[u.g]._id,
      });
    } else {
      doc.password = PASSWORD; // Fuerza la contraseña HelloWorld*29
      doc.gremio = gremios[u.g]._id;
    }
    await doc.save();
    usuarios.push(doc);
  }

  let admin = await Usuario.findOne({ alias: "Director" });
  if (!admin) {
    admin = new Usuario({ alias: "Director", password: PASSWORD, especialidad: "Conspirador", role: "admin" });
  } else {
    admin.password = PASSWORD; // Fuerza la contraseña HelloWorld*29
    admin.role = "admin";
  }
  await admin.save();
  //Borrar despues hasta aqui!!

  // Situaciones del foro
  let situacionesNuevas = 0;
  for (const titulo of situacionesData) {
    if (!(await Situacion.findOne({ titulo }))) {
      await Situacion.create({ titulo, creador: admin._id });
      situacionesNuevas++;
    }
  }

  // Coartadas
  let nuevas = 0;
  let votosNuevos = 0;
  for (let i = 0; i < coartadasData.length; i++) {
    const c = coartadasData[i];
    if (await Coartada.findOne({ titulo: c.titulo })) continue; // ya existe

    const autorIdx = c.autor;
    const detalles = Array.from({ length: c.nd }, (_, k) => detallesBase[k % detallesBase.length]);
    const coartada = new Coartada({
      titulo: c.titulo,
      situacion: situacionesData[c.s],
      historia: `${c.titulo}. Fue algo inesperado que me impidió cumplir a tiempo, y puedo explicar cada paso de lo que pasó.`,
      detalles,
      estado: c.estado,
      autor: usuarios[autorIdx]._id,
    });

    // Votos (nunca del autor, uno por usuario)
    const cantidad = votosPorCoartada[i] || 0;
    let creados = 0;
    for (let offset = 1; creados < cantidad; offset++) {
      const votanteIdx = (autorIdx + offset * 2 + i) % usuarios.length;
      if (votanteIdx === autorIdx) continue;
      const votante = usuarios[votanteIdx];
      if (coartada.votos.some((v) => v.usuario.toString() === votante._id.toString())) continue;
      const base = c.estado === "Rejected" ? 2 : 3;
      coartada.votos.push({
        usuario: votante._id,
        credibilidad: Math.min(5, base + ((i + offset) % 3)),
        creatividad: Math.min(5, base + ((i * 2 + offset) % 3)),
        consistencia: Math.min(5, base + ((i + offset * 2) % 3)),
      });
      creados++;
    }
    votosNuevos += creados;

    // Cadena de testigos
    const cadena = cadenasData.find((x) => x.coartada === i);
    if (cadena) coartada.testigos = cadena.testigos.map((t) => usuarios[t]._id);

    // Coartada expuesta: 3 marcas falsas
    if (c.expuesta) {
      const marcadores = [0, 1, 2, 4].filter((m) => m !== autorIdx).slice(0, 3);
      coartada.marcasFalsas = marcadores.map((m) => usuarios[m]._id);
      coartada.expuesta = true;
    }

    await coartada.save(); // recalcula el índice de credibilidad
    nuevas++;

  // Penalización por exposición: -10 y bloqueo de 7 días
    if (c.expuesta) {
      const autor = usuarios[autorIdx];
      await Usuario.updateOne(
        { _id: autor._id },
        { 
          $inc: { credibilidad: -10 },
          $set: { bloqueadoHasta: new Date(Date.now() + SIETE_DIAS) }
        }
      );
    }
  }

  console.log("Datos de ejemplo listos (no se borró nada):");
  console.log(`  Situaciones nuevas: ${situacionesNuevas}`);
  console.log(`  Coartadas nuevas:   ${nuevas} (de ${coartadasData.length})  |  Votos nuevos: ${votosNuevos}`);
  console.log(`Contraseña de todos los usuarios: ${PASSWORD}`);
  console.log("Administrador: Director  |  Bloqueado (para probar la regla): Cowfarm");

  await mongoose.disconnect();
}

ejecutar().catch((error) => {
  console.error("Error creando datos de ejemplo:", error);
  process.exit(1);
});