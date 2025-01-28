const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Validation schema
const choreSchema = Joi.object({
    title: Joi.string().required(),
    points: Joi.number().required().min(0),
    is_repeat: Joi.boolean().default(false),
    repeat_start_date: Joi.date().allow(null),
    repeat_interval: Joi.string().valid('daily', 'weekly', 'monthly', null).allow(null),
    repeat_all_day: Joi.boolean().default(true),
    repeat_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(null),
    repeat_days: Joi.array().items(Joi.string()).allow(null),
    repeat_until: Joi.date().allow(null),
    profile_ids: Joi.array().items(Joi.number()).required()
});

// Get all chores
router.get('/', async (req, res) => {
    try {
        const [chores] = await req.db.query(`
            SELECT 
                c.*,
                GROUP_CONCAT(DISTINCT JSON_OBJECT(
                    'id', p.id,
                    'name', p.name,
                    'role', p.role
                )) as profiles
            FROM chores c
            LEFT JOIN chore_profiles cp ON c.id = cp.chore_id
            LEFT JOIN profiles p ON cp.profile_id = p.id
            GROUP BY c.id
        `);

        // Parse profiles JSON string
        const formattedChores = chores.map(chore => ({
            ...chore,
            is_repeat: chore.is_repeat === 1,
            repeat_all_day: chore.repeat_all_day === 1,
            profiles: chore.profiles ? JSON.parse(`[${chore.profiles}]`) : []
        }));

        res.json(formattedChores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new chore
router.post('/', async (req, res) => {
    try {
        const { error } = choreSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { title, points, is_repeat, repeat_start_date, repeat_interval, repeat_all_day, repeat_time, repeat_days, repeat_until, profile_ids } = req.body;

        const connection = await req.db.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                'INSERT INTO chores (title, points, is_repeat, repeat_start_date, repeat_interval, repeat_all_day, repeat_time, repeat_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [title, points, is_repeat, repeat_start_date, repeat_interval, repeat_all_day, repeat_time, repeat_until]
            );

            const choreId = result.insertId;

            // Create chore_profiles records for each profile
            await Promise.all(profile_ids.map(profileId =>
                connection.query(
                    'INSERT INTO chore_profiles (chore_id, profile_id) VALUES (?, ?)',
                    [choreId, profileId]
                )
            ));

            await connection.commit();

            res.status(201).json({
                id: choreId,
                ...req.body
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle chore completion
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { profileId, isCompleted } = req.body;
        const choreId = req.params.id;
        const assignmentDate = req.body.date; // Frontend'den gelen tarih

        const connection = await req.db.getConnection();
        try {
            await connection.beginTransaction();

            // Önce chore'un puanını al
            const [[chore]] = await connection.query(
                'SELECT points FROM chores WHERE id = ?',
                [choreId]
            );

            // Önce bu tarihteki assignment'ı kontrol et
            const [[existingAssignment]] = await connection.query(
                `SELECT * FROM chore_assignments 
                 WHERE chore_id = ? AND profile_id = ? AND assignment_date = ?`,
                [choreId, profileId, assignmentDate]
            );

            if (existingAssignment) {
                // Varolan kaydı güncelle
                await connection.query(
                    `UPDATE chore_assignments 
                     SET is_completed = ?, completed_at = ?
                     WHERE chore_id = ? AND profile_id = ? AND assignment_date = ?`,
                    [isCompleted, isCompleted ? new Date() : null, choreId, profileId, assignmentDate]
                );
            } else {
                // Yeni kayıt oluştur
                await connection.query(
                    `INSERT INTO chore_assignments 
                     (chore_id, profile_id, is_completed, completed_at, assignment_date)
                     VALUES (?, ?, ?, ?, ?)`,
                    [choreId, profileId, isCompleted, isCompleted ? new Date() : null, assignmentDate]
                );
            }

            // Tamamlandıysa puan ekle, tamamlanmadıysa puanı geri al
            await connection.query(
                'UPDATE profiles SET points = points + ? WHERE id = ?',
                [isCompleted ? chore.points : -chore.points, profileId]
            );

            await connection.commit();

            // Fetch updated chore with all assignments
            const [profiles] = await req.db.query('SELECT * FROM profiles');

            // Then get all chores with their assignments for the specific date
            const [chores] = await req.db.query(`
                SELECT 
                    c.*,
                    ca.profile_id,
                    ca.is_completed,
                    ca.completed_at,
                    ca.assignment_date
                FROM chores c
                LEFT JOIN chore_assignments ca ON c.id = ca.chore_id
                WHERE (ca.assignment_date = ? OR ca.assignment_date IS NULL)
                ORDER BY c.id, ca.profile_id
            `, [assignmentDate]);

            // Group chores by profile
            const profilesWithChores = profiles.map(profile => {
                const profileChores = chores
                    .filter(chore => chore.profile_id === profile.id)
                    .map(chore => ({
                        id: chore.id,
                        title: chore.title,
                        points: chore.points,
                        is_repeat: chore.is_repeat === 1,
                        repeat_start_date: chore.repeat_start_date,
                        repeat_interval: chore.repeat_interval,
                        repeat_all_day: chore.repeat_all_day === 1,
                        repeat_time: chore.repeat_time,
                        repeat_days: chore.repeat_days,
                        repeat_until: chore.repeat_until,
                        is_completed: chore.is_completed === 1,
                        completed_at: chore.completed_at
                    }));

                return {
                    ...profile,
                    chores: profileChores
                };
            });

            res.json(profilesWithChores);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete chore
router.delete('/:id', async (req, res) => {
    try {
        const choreId = req.params.id;
        const connection = await req.db.getConnection();

        try {
            await connection.beginTransaction();

            // Önce chore_assignments kayıtlarını sil
            await connection.query(
                'DELETE FROM chore_assignments WHERE chore_id = ?',
                [choreId]
            );

            // Sonra chore_profiles kayıtlarını sil
            await connection.query(
                'DELETE FROM chore_profiles WHERE chore_id = ?',
                [choreId]
            );

            // En son chore'u sil
            await connection.query(
                'DELETE FROM chores WHERE id = ?',
                [choreId]
            );

            await connection.commit();
            res.json({ message: 'İş başarıyla silindi' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 