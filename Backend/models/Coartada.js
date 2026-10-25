const mongoose = require("mongoose");

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
    testigos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],
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
    votos: [votoSchema],
    marcasFalsas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],
    expuesta: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Coartada", coartadaSchema);