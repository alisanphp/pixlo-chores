const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Validation schema
const penaltySchema = Joi.object({
    name: Joi.string().required(),
    points: Joi.number().required().min(0),
    profile_id: Joi.number().required()
});

// Get all penalties
router.get('/', async (req, res) => {
    try {
        const [penalties] = await req.db.query(`
            SELECT p.*, pr.name as profile_name 
            FROM penalties p
            JOIN profiles pr ON p.profile_id = pr.id
            ORDER BY p.created_at DESC
        `);
        res.json(penalties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new penalty
router.post('/', async (req, res) => {
    try {
        const { error } = penaltySchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, points, profile_id } = req.body;
        const connection = await req.db.getConnection();

        try {
            await connection.beginTransaction();

            // Insert penalty
            const [result] = await connection.query(
                'INSERT INTO penalties (name, points, profile_id) VALUES (?, ?, ?)',
                [name, points, profile_id]
            );

            // Reduce profile points
            await connection.query(
                'UPDATE profiles SET points = points - ? WHERE id = ?',
                [points, profile_id]
            );

            await connection.commit();

            // Get profile name for response
            const [[profile]] = await req.db.query(
                'SELECT name FROM profiles WHERE id = ?',
                [profile_id]
            );

            res.status(201).json({
                id: result.insertId,
                name,
                points,
                profile_id,
                profile_name: profile.name,
                created_at: new Date()
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

// Delete penalty
router.delete('/:id', async (req, res) => {
    try {
        const penaltyId = req.params.id;
        const connection = await req.db.getConnection();

        try {
            await connection.beginTransaction();

            // Önce penalty'nin bilgilerini al
            const [[penalty]] = await connection.query(
                'SELECT points, profile_id FROM penalties WHERE id = ?',
                [penaltyId]
            );

            if (!penalty) {
                return res.status(404).json({ error: 'Penalty not found' });
            }

            // Profil puanlarını geri ekle
            await connection.query(
                'UPDATE profiles SET points = points + ? WHERE id = ?',
                [penalty.points, penalty.profile_id]
            );

            // Penalty'yi sil
            await connection.query(
                'DELETE FROM penalties WHERE id = ?',
                [penaltyId]
            );

            await connection.commit();
            res.json({ message: 'Ceza başarıyla silindi' });
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