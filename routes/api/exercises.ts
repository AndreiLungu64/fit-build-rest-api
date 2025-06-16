import express from 'express';
import { exercisesController } from '../../controllers/exercisesController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

// Public routes
router.get('/', exercisesController.getAllExercises);
router.get('/:id', exercisesController.getExerciseById);
router.get('/muscle/:muscleGroup', exercisesController.getExercisesByMuscleGroup);
router.get('/difficulty/:difficulty', exercisesController.getExercisesByDifficulty);

// Protected routes (require authentication)
router.post('/', verifyJWT, exercisesController.createExercise);
router.put('/:id', verifyJWT, exercisesController.updateExercise);
router.delete('/:id', verifyJWT, exercisesController.deleteExercise);

export default router;
