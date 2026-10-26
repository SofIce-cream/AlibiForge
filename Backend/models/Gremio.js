const moongose = require('mongoose');

const gremioShema = new mongoose.Schema(
    {
    nombre:{
        type: String,
        required : [true, 'El nombre del gremio es obligatorio'],
        unique: true,
        trim: true,
    },
    descripcion:{ type: String, trim: true, default: ""},
    },
    {timestamps: true},
);

module.exports = moongose.model('Gremio', gremioShema);