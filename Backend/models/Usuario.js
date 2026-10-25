const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema(
  {
    alias: {
      type: String,
      required: [true, "El alias es obligatorio"],
      unique: true,
      trim: true,
      minlength: [3, "El alias debe tener al menos 3 caracteres"],
      maxlength: [30, "El alias no puede tener más de 30 caracteres"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    especialidad: {
      type: String,
      enum: {
        values: ["Excusa Creativa", "Detallista", "Improvisador", "Conspirador"],
        message: "La especialidad {VALUE} no es válida",
      },
      default: "Excusa Creativa",
    },
    credibilidad: {
      type: Number,
      default: 0,
    },
    bloqueadoHasta: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true },
);

// Hashear password antes de guardar
usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

usuarioSchema.methods.compararPasswords = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model("Usuario", usuarioSchema);