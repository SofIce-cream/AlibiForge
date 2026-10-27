const express = require("express");
const Gremio = require("../models/Gremio");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const gremios = await Gremio.find().sort({ nombre: 1 });
    res.json({ ok: true, count: gremios.length, gremios });
  }),
);

module.exports = router;