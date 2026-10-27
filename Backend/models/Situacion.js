const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema(
    {
        usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true},
        mensaje: {type: String, trim: true, maxlength: 300, default: ""},
    },
    {timestamps: true},
);

const situacionSchema = new mongoose.Schema(
    {
        titulo: {
            type: String,
            required: [true, "El título de la situación es obligatorio"],
            unique: true,
            trim: true,
            minlength: [3, "El título debe tener al menos 3 caracteres"],
            maxlength: [100, "El título no puede superar los 100 caracteres"],
        },
        descripcion: {type: String, trim: true, maxlength: 300, default: ""},
        creador: {type: mongoose.Schema.Types.ObjectId, ref: "Usuario"},
        solicitudes: [solicitudSchema],
    },
    {timestamps: true},
);

module.exports = mongoose.model("Situacion", situacionSchema);