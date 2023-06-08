import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { open } from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import { setWallpaper } from 'wallpaper';
import cors from '@fastify/cors';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
const DIR_PATH = 'upload';

const fastify = Fastify();

fastify.register(cors);
fastify.register(multipart);

fastify.post('/set-desktop-wallpaper', async (req, reply) => {
  const file = await req.file();

  if (!file?.filename) {
    return reply.status(400).send({
      message: 'Please provide an image to set',
    });
  }

  // if the file is image or not
  if (!ALLOWED_TYPES.includes(file.mimetype))
    return reply.status(400).send({
      message: 'Only images are allowed',
    });

  const pathToSave = path.join(DIR_PATH, file.filename);
  const writableFile = await open(pathToSave, 'w');
  const writableStream = writableFile.createWriteStream();
  await pipeline(file.file, writableStream);

  await setWallpaper(pathToSave);
  reply.send({
    message: 'The wallpaper has been set',
  });
});

fastify.listen(
  {
    port: 5000,
  },
  (err, addr) => {
    if (err) console.log(err);
    else {
      console.log('Server is running 🍕', addr);
    }
  }
);
