import { Request, Response } from 'express';
import exerciseRepository, { Exercise } from '../repository/exercisesRepository.js';

const getAllExercises = async (req: Request, res: Response) => {
  try {
    const exercises = await exerciseRepository.getAll();
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getExerciseById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid exercise ID' });
      return;
    }

    const exercise = await exerciseRepository.getById(id);
    if (!exercise) {
      res.status(404).json({ message: `Exercise ID ${req.params.id} not found` });
      return;
    }

    res.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getExercisesByMuscleGroup = async (req: Request, res: Response) => {
  try {
    const muscleGroup = req.params.muscleGroup;

    if (!muscleGroup) {
      res.status(400).json({ message: 'Muscle group parameter is required' });
      return;
    }

    const exercises = await exerciseRepository.getByMuscleGroup(muscleGroup);
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises by muscle group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getExercisesByDifficulty = async (req: Request, res: Response) => {
  try {
    const difficulty = req.params.difficulty;

    if (!difficulty || !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      res.status(400).json({
        message: 'Valid difficulty parameter is required (beginner, intermediate, or advanced)',
      });
      return;
    }

    const exercises = await exerciseRepository.getByDifficulty(difficulty);
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises by difficulty:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createExercise = async (req: Request, res: Response) => {
  try {
    const { name, description, muscle_group, difficulty, equipment, instructions } = req.body;

    // Validate required fields
    if (!name || !muscle_group || !difficulty) {
      res.status(400).json({
        message: 'Required fields missing. Name, muscle group, and difficulty are required.',
      });
      return;
    }

    // Validate difficulty enum
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      res.status(400).json({
        message: 'Invalid difficulty level. Must be beginner, intermediate, or advanced.',
      });
      return;
    }

    const newExercise = await exerciseRepository.create({
      name,
      description,
      muscle_group,
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      equipment,
      instructions,
    });

    res.status(201).json(newExercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateExercise = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid exercise ID' });
      return;
    }

    const existingExercise = await exerciseRepository.getById(id);
    if (!existingExercise) {
      res.status(404).json({ message: `Exercise ID ${id} not found` });
      return;
    }

    const { name, description, muscle_group, difficulty, equipment, instructions } = req.body;

    // Validate difficulty if provided
    if (difficulty && !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      res.status(400).json({
        message: 'Invalid difficulty level. Must be beginner, intermediate, or advanced.',
      });
      return;
    }

    const updateData: Partial<Exercise> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (muscle_group !== undefined) updateData.muscle_group = muscle_group;
    if (difficulty !== undefined)
      updateData.difficulty = difficulty as 'beginner' | 'intermediate' | 'advanced';
    if (equipment !== undefined) updateData.equipment = equipment;
    if (instructions !== undefined) updateData.instructions = instructions;

    const updatedExercise = await exerciseRepository.update(id, updateData);
    res.json(updatedExercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteExercise = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid exercise ID' });
      return;
    }

    const existingExercise = await exerciseRepository.getById(id);
    if (!existingExercise) {
      res.status(404).json({ message: `Exercise ID ${id} not found` });
      return;
    }

    await exerciseRepository.delete(id);
    res.json({ message: `Exercise ID ${id} successfully deleted` });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const exercisesController = {
  getAllExercises,
  getExerciseById,
  getExercisesByMuscleGroup,
  getExercisesByDifficulty,
  createExercise,
  updateExercise,
  deleteExercise,
};

export { exercisesController };
