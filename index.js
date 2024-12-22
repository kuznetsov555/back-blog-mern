import express from 'express';
import multer from 'multer';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import { validationResult } from 'express-validator';
import checkAuth from './utils/checkAuth.js';
import UserModel from './models/User.js';
import * as PostController from './controllers/PostController.js'
import * as UserController from './controllers/UserController.js';
import handleValidationErrors from './utils/handleValidationErrors.js';
import cors from 'cors'

mongoose
    .connect('mongodb+srv://maxim17042003:BNlBwisu2SO98gHg@cluster0.ffwqw.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('DB OK'))
    .catch((err) => console.log('DB Error', err));

    const app = express();

    const storage = multer.diskStorage({
      destination: (_, __, cb) => {
        if (!fs.existsSync('uploads')) {
          fs.mkdirSync('uploads');
        }
        cb(null, 'uploads');
      },
      filename: (_, file, cb) => {
        cb(null, file.originalname);
      },
    });
    
    const upload = multer({ storage });
    
    app.use(express.json());
    app.use(cors());
    app.use('/uploads', express.static('uploads'));
    
    app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
    app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
    app.get('/auth/me', checkAuth, UserController.getMe);
    
    app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
      res.json({
        url: `/uploads/${req.file.originalname}`,
      });
    });
    
    app.get('/tags', PostController.getLastTags);
    
    app.get('/posts', PostController.getAll);
    app.get('/posts/tags', PostController.getLastTags);
    app.get('/posts/:id', PostController.getOne);
    app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
    app.delete('/posts/:id', checkAuth, PostController.remove);
    app.patch(
      '/posts/:id',
      checkAuth,
      postCreateValidation,
      handleValidationErrors,
      PostController.update,
    );
    
    app.listen(process.env.PORT || 4444, (err) => {
      if (err) {
        return console.log(err);
      }
    
      console.log('Server OK');
});
