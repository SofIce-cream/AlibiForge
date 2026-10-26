const mongoose = require("mongoose");
const { calcularIndiceCredibilidad } = require("../utils/credibilidad");

const votoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    credibilidad: { type: Number, min: 1, max: 5, required: true },
    creatividad: { type: Number, min: 1, max: 5, required: true },
    consistencia: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false, timestamps: true },
);

const coartadaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      minlength: [3, "El título debe tener al menos 3 caracteres"],
      maxlength: [100, "El título no puede tener más de 100 caracteres"],
    },
    situacion: {
      type: String,
      required: [true, "La situación es obligatoria"],
      trim: true,
    },
    historia: {
      type: String,
      required: [true, "La historia es obligatoria"],
      trim: true,
      maxlength: [500, "La historia no puede superar los 500 caracteres"],
    },
    detalles: {
      type: [String],
      validate: {
        validator: (arr) => arr.filter((d) => d && d.trim() !== "").length >= 3,
        message: "La coartada debe tener al menos 3 detalles",
      },
    },
    testigos: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }],
      validate: {
        validator: (arr) => new Set(arr.map((t) => t.toString())).size === arr.length,
        message: "Un usuario no puede ser testigo dos veces de la misma coartada",
      },
    },
    estado: {
      type: String,
      enum: {
        values: ["Draft", "Submitted", "UnderReview", "Rejected", "Approved"],
        message: "El estado {VALUE} no es válido",
      },
      default: "Draft",
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "La coartada debe estar vinculada a un autor"],
    },
    // Un voto por usuario y coartada
    votos: {
      type: [votoSchema],
      validate: {
        validator: (arr) => new Set(arr.map((v) => v.usuario.toString())).size === arr.length,
        message: "Un usuario solo puede votar una vez por coartada",
      },
    },
    marcasFalsas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }],
    expuesta: { type: Boolean, default: false },
    // Se recalcula en cada guardado (voto, testigo, detalles...)
    indiceCredibilidad: { type: Number, default: 0 },
  },
  { timestamps: true },
);

coartadaSchema.pre("validate", function () {
  this.indiceCredibilidad = calcularIndiceCredibilidad(this);
});

module.exports = mongoose.model("Coartada", coartadaSchema);