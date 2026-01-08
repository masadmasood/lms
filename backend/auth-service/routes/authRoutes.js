import express from 'express';
import { login, register, getAllStudents, deleteStudent } from '../controllers/authController.js';

const router = express.Router();

// POST /auth/login - Basic login with email/username and password
router.post('/login', login);

// POST /auth/register - Register new student (Admin only)
router.post('/register', register);

// GET /auth/students - Get all students (Admin only)
router.get('/students', getAllStudents);

// DELETE /auth/students/:id - Delete a student (Admin only)
router.delete('/students/:id', deleteStudent);

export default router;
