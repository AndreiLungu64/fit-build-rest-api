import { query } from '../db/db.js';

export interface Exercise {
  id?: number;
  name: string;
  description?: string;
  muscle_group: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string;
  instructions?: string;
  created_at?: Date;
}

class ExerciseRepository {
  // Get all exercises
  async getAll(): Promise<Exercise[]> {
    const result = await query('SELECT * FROM exercises ORDER BY id ASC');
    return result.rows;
  }

  // Get exercises by muscle group
  async getByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    const result = await query('SELECT * FROM exercises WHERE muscle_group = $1 ORDER BY id ASC', [
      muscleGroup,
    ]);
    return result.rows;
  }

  // Get exercises by difficulty
  async getByDifficulty(difficulty: string): Promise<Exercise[]> {
    const result = await query('SELECT * FROM exercises WHERE difficulty = $1 ORDER BY id ASC', [
      difficulty,
    ]);
    return result.rows;
  }

  // Get exercise by ID
  async getById(id: number): Promise<Exercise | null> {
    const result = await query('SELECT * FROM exercises WHERE id = $1', [id]);
    return result.rows.length ? result.rows[0] : null;
  }

  // Create a new exercise
  async create(exercise: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise> {
    const result = await query(
      'INSERT INTO exercises (name, description, muscle_group, difficulty, equipment, instructions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        exercise.name,
        exercise.description || null,
        exercise.muscle_group,
        exercise.difficulty,
        exercise.equipment || null,
        exercise.instructions || null,
      ]
    );
    return result.rows[0];
  }

  // Update an exercise
  async update(id: number, exercise: Partial<Exercise>): Promise<Exercise | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Add each field that needs to be updated
    if (exercise.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(exercise.name);
      paramIndex++;
    }

    if (exercise.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(exercise.description);
      paramIndex++;
    }

    if (exercise.muscle_group !== undefined) {
      updates.push(`muscle_group = $${paramIndex}`);
      values.push(exercise.muscle_group);
      paramIndex++;
    }

    if (exercise.difficulty !== undefined) {
      updates.push(`difficulty = $${paramIndex}`);
      values.push(exercise.difficulty);
      paramIndex++;
    }

    if (exercise.equipment !== undefined) {
      updates.push(`equipment = $${paramIndex}`);
      values.push(exercise.equipment);
      paramIndex++;
    }

    if (exercise.instructions !== undefined) {
      updates.push(`instructions = $${paramIndex}`);
      values.push(exercise.instructions);
      paramIndex++;
    }

    // If no fields to update, return the current exercise
    if (updates.length === 0) {
      return this.getById(id);
    }

    // Add id as the last parameter
    values.push(id);

    const result = await query(
      `UPDATE exercises SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length ? result.rows[0] : null;
  }

  // Delete an exercise
  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM exercises WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export default new ExerciseRepository();
