const cron = require('node-cron');
const Painting = require('../models/painting');
const { connectToDatabase } = require('./db');

const activatePainting = async () => {
  // Queries no longer buffer, so the connection has to be up first.
  await connectToDatabase()

  let paintingToUpdate
  const activePaintings = await Painting.find({ isActive: true })

  if (activePaintings.length === 0) {
    const nextPainting = await Painting.findById(1)
    paintingToUpdate = nextPainting
  } else {
    const lastActivePaintingId = activePaintings.sort((a, b) => b.id - a.id)[0].id
    const nextId = Number(lastActivePaintingId) + 1
    const nextPainting = await Painting.findById(nextId)
    if (nextPainting) {
      paintingToUpdate = nextPainting
    }
  }

  if (paintingToUpdate) {
    paintingToUpdate.isActive = true
    await paintingToUpdate.save()
    console.log(`Painting ${paintingToUpdate._id} is activated.`)
  } else {
    console.log('No painting found to activate')
  }
}

cron.schedule('0 0 * * *', () => {
  console.log('Running cron job to activate painting');
  activatePainting();
})