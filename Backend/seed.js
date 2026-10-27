require("dotenv").config();
const mongoose = require("mongoose");

const Gremio = require("./models/Gremio");
const Usuario = require("./models/Usuario");
const Coartada = require("./models/Coartada");
const Situacion = require("./models/Situacion");

const PASSWORD = "clave123";

const gremiosData = [
  { nombre: "The Excuse Makers", descripcion: "Los que inventan la excusa más creativa." },
  { nombre: "The Detail Weavers", descripcion: "Tejen cada detalle hasta que nadie dude." },
  { nombre: "The Improvisers", descripcion: "Respuesta inmediata bajo presión." },
];

// 12 usuarios: 4 por especialidad/gremio
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
  // Draft (3)
  { titulo: "El gato en el teclado", autor: 0, s: 5, estado: "Draft", nd: 3 },
  { titulo: "Apagón en mi cuadra", autor: 5, s: 3, estado: "Draft", nd: 5 },
  { titulo: "La alarma que no sonó", autor: 8, s: 0, estado: "Draft", nd: 3 },
  // Submitted (4)
  { titulo: "Llanta pinchada camino a la U", autor: 1, s: 0, estado: "Submitted", nd: 5 },
  { titulo: "El bus se varó en la autopista", autor: 4, s: 3, estado: "Submitted", nd: 10 },
  { titulo: "Cita médica de urgencia", autor: 9, s: 9, estado: "Submitted", nd: 3 },
  { titulo: "Se dañó el internet justo al entregar", autor: 6, s: 4, estado: "Submitted", nd: 5 },
  // Approved (5)
  { titulo: "Inundación en el sótano", autor: 2, s: 1, estado: "Approved", nd: 10 },
  { titulo: "Mi abuela necesitaba ayuda", autor: 7, s: 8, estado: "Approved", nd: 5 },
  { titulo: "Cargador roto y laptop apagada", autor: 3, s: 5, estado: "Approved", nd: 5 },
  { titulo: "Trancón por marcha estudiantil", autor: 10, s: 7, estado: "Approved", nd: 10 },
  { titulo: "Intoxicación por empanada", autor: 11, s: 2, estado: "Approved", nd: 3 },
  // Rejected (3) -> la 1ª fue expuesta por la comunidad (3 marcas falsas)
  { titulo: "Me secuestraron los alienígenas", autor: 0, s: 4, estado: "Rejected", nd: 3, expuesta: true },
  { titulo: "Perdí el celular y la memoria", autor: 8, s: 6, estado: "Rejected", nd: 3 },
  { titulo: "El perro se comió mi USB", autor: 5, s: 5, estado: "Rejected", nd: 5 },
];

// Cadenas de testigos (índice de coartada -> índices de usuarios), 2 a 5 testigos
const cadenasData = [
  { coartada: 7, testigos: [3, 4, 5, 8, 9] },
  { coartada: 10, testigos: [0, 1, 6, 7] },
  { coartada: 8, testigos: [1, 2, 11] },
  { coartada: 4, testigos: [2, 10, 9] },
  { coartada: 3, testigos: [5, 11] },
];

// 30 votos en las 12 coartadas no-borrador
const votosPorCoartada = {
  3: 3, 4: 3, 5: 2, 6: 2,
  7: 3, 8: 3, 9: 3, 10: 3, 11: 2,
  12: 2, 13: 2, 14: 2,
};

const textoHistoria = (titulo) =>
  `${titulo}. Fue algo inesperado que me impidió cumplir a tiempo, y puedo explicar cada paso de lo que pasó.`;

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

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Conectado a MongoDB. Limpiando colecciones...");
  await Promise.all([
    Gremio.deleteMany({}),
    Usuario.deleteMany({}),
    Coartada.deleteMany({}),
    Situacion.deleteMany({}),
  ]);

  const gremios = await Gremio.insertMany(gremiosData);

  // save() para que se hashee la contraseña
  const usuarios = [];
  for (const u of usuariosData) {
    const usuario = new Usuario({
      alias: u.alias,
      password: PASSWORD,
      especialidad: u.especialidad,
      gremio: gremios[u.g]._id,
    });
    await usuario.save();
    usuarios.push(usuario);
  }
  const admin = new Usuario({
    alias: "Director",
    password: PASSWORD,
    especialidad: "Conspirador",
    role: "admin",
  });
  await admin.save();

  await Situacion.insertMany(
    situacionesData.map((titulo) => ({ titulo, creador: admin._id })),
  );

  const coartadas = [];
  for (let i = 0; i < coartadasData.length; i++) {
    const c = coartadasData[i];
    const detalles = Array.from({ length: c.nd }, (_, k) => detallesBase[k % detallesBase.length]);
    coartadas.push(
      new Coartada({
        titulo: c.titulo,
        situacion: situacionesData[c.s],
        historia: textoHistoria(c.titulo),
        detalles,
        estado: c.estado,
        autor: usuarios[c.autor]._id,
      }),
    );
  }

  // Votos (nunca del autor, uno por usuario)
  Object.keys(votosPorCoartada).forEach((key) => {
    const idx = Number(key);
    const coartada = coartadas[idx];
    const autorIdx = coartadasData[idx].autor;
    let creados = 0;
    for (let offset = 1; creados < votosPorCoartada[idx]; offset++) {
      const votanteIdx = (autorIdx + offset * 2 + idx) % usuarios.length;
      if (votanteIdx === autorIdx) continue;
      const votante = usuarios[votanteIdx];
      if (coartada.votos.some((v) => v.usuario.toString() === votante._id.toString())) continue;
      const base = coartadasData[idx].estado === "Rejected" ? 2 : 3;
      coartada.votos.push({
        usuario: votante._id,
        credibilidad: Math.min(5, base + ((idx + offset) % 3)),
        creatividad: Math.min(5, base + ((idx * 2 + offset) % 3)),
        consistencia: Math.min(5, base + ((idx + offset * 2) % 3)),
      });
      creados++;
    }
  });

  //Alibichains
  cadenasData.forEach((cadena) => {
    coartadas[cadena.coartada].testigos = cadena.testigos.map((t) => usuarios[t]._id);
  });

  //Coartada expuesta (3 marcas falsas)
  coartadas.forEach((coartada, i) => {
    if (coartadasData[i].expuesta) {
      const autorIdx = coartadasData[i].autor;
      const marcadores = [1, 2, 3, 4].filter((m) => m !== autorIdx).slice(0, 3);
      coartada.marcasFalsas = marcadores.map((m) => usuarios[m]._id);
      coartada.expuesta = true;
    }
  });

  for (const coartada of coartadas) await coartada.save(); // recalcula indiceCredibilidad

  // Penalización por exposición: -10 y bloqueo de 7 días
  for (let i = 0; i < coartadas.length; i++) {
    if (coartadasData[i].expuesta) {
      const autor = usuarios[coartadasData[i].autor];
      autor.credibilidad = -10;
      autor.bloqueadoHasta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await autor.save();
    }
  }

  const totalVotos = coartadas.reduce((acc, c) => acc + c.votos.length, 0);
  console.log("Seed completado:");
  console.log(`  Gremios: ${gremios.length} | Usuarios: ${usuarios.length} + 1 admin`);
  console.log(`  Coartadas: ${coartadas.length} | Votos: ${totalVotos} | Cadenas: ${cadenasData.length}`);
  console.log(`Contraseña de todos: ${PASSWORD} | Admin: Director`);
  console.log(`Bloqueado por exposición: ${usuariosData[0].alias}`);

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Error en el seed:", error);
  process.exit(1);
});