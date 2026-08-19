require('dotenv').config();
const paintingsRouter = require('express').Router();
const Painting = require('../models/painting');
const { basicAuth } = require('../utils/middleware');

paintingsRouter.get('/last-id', async (request, response) => {
  const activePaintings = await Painting.find({ isActive: true })

  if (activePaintings.length === 0) {
    return response.status(404).json({ error: 'No active painting found' })
  }

  const lastActivePaintingId = activePaintings.sort((a, b) => b.id - a.id)[0].id

  response.status(200).json({ lastId: lastActivePaintingId })
})

paintingsRouter.get('/:id', async (request, response) => {
  const painting = await Painting.findById(request.params.id)

  if (!painting || painting.isActive === false) {
    return response.status(404).json({ error: 'No painting found' })
  }

  response.status(200).json(painting)
})

paintingsRouter.post('/', basicAuth, async (request, response) => {
  const body = request.body;
  const totalPaintings = await Painting.find().count();

  const painting = new Painting({
    _id: totalPaintings + 1,
    title: body.title,
    hints: body.hints,
  })

  const savedPainting = await painting.save()

  response.status(201).json(savedPainting)
})

module.exports = paintingsRouter