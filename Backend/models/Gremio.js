const mongoose = require("mongoose");

const gremioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del gremio es obligatorio"],
      unique: true,
      trim: true,
    },
    descripcion: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Gremio", gremioSchema);