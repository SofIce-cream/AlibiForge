// Uso:  npm run usuarios:prueba
require("dotenv").config();
const mongoose = require("mongoose");
const Gremio = require("./models/Gremio");
const Usuario = require("./models/Usuario");

const PASSWORD = "clave123";

const gremios = [
  { nombre: "The Excuse Makers", descripcion: "Los que inventan la excusa más creativa." },
  { nombre: "The Detail Weavers", descripcion: "Tejen cada detalle hasta que nadie dude." },
  { nombre: "The Improvisers", descripcion: "Respuesta inmediata bajo presión." },
];

const usuarios = [
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
  { alias: "Director", especialidad: "Conspirador", g: null, role: "admin" },
];

async function crear() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Gremios: se crean solo si no existen
  const gremiosDocs = [];
  for (const g of gremios) {
    let doc = await Gremio.findOne({ nombre: g.nombre });
    if (!doc) doc = await Gremio.create(g);
    gremiosDocs.push(doc);
  }

  let creados = 0;
  let existentes = 0;
  for (const u of usuarios) {
    const ya = await Usuario.findOne({ alias: u.alias });
    if (ya) {
      existentes++;
      continue;
    }
    const usuario = new Usuario({
      alias: u.alias,
      password: PASSWORD, // se hashea en el hook del modelo
      especialidad: u.especialidad,
      gremio: u.g === null ? null : gremiosDocs[u.g]._id,
      role: u.role || "user",
    });
    await usuario.save();
    creados++;
  }

  console.log(`Usuarios creados: ${creados} | ya existían: ${existentes}`);
  console.log(`Contraseña de todos: ${PASSWORD}`);
  console.log("Usuario normal: ShadowHuntress, TomatoSoup, QuickFox...  |  Administrador: Director");

  await mongoose.disconnect();
}

crear().catch((error) => {
  console.error("Error creando usuarios:", error);
  process.exit(1);
});