const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const Joi = require('joi');

// Validation schema
const rewardSchema = Joi.object({
    name: Joi.string().required(),
    points_cost: Joi.number().required().min(0)
});

// Get all rewards
router.get('/', async (req, res) => {
    try {
        // Rewards ve assignments'ları birlikte getir
        const [rewards] = await req.db.query(`
            SELECT 
                r.*,
                ra.profile_id,
                ra.assigned_at,
                p.name as profile_name
            FROM rewards r
            LEFT JOIN reward_assignments ra ON r.id = ra.reward_id
            LEFT JOIN profiles p ON ra.profile_id = p.id
            ORDER BY r.id, ra.assigned_at DESC
        `);
        
        // Rewards'ları grupla ve assignments'ları ekle
        const groupedRewards = rewards.reduce((acc, curr) => {
            const existing = acc.find(r => r.id === curr.id);
            if (existing) {
                if (curr.profile_id) {
                    existing.assignments.push({
                        profile_id: curr.profile_id,
                        profile_name: curr.profile_name,
                        assigned_at: curr.assigned_at
                    });
                }
            } else {
                acc.push({
                    id: curr.id,
                    name: curr.name,
                    points_cost: curr.points_cost,
                    created_at: curr.created_at,
                    assignments: curr.profile_id ? [{
                        profile_id: curr.profile_id,
                        profile_name: curr.profile_name,
                        assigned_at: curr.assigned_at
                    }] : []
                });
            }
            return acc;
        }, []);
        
        res.json(groupedRewards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new reward
router.post('/', async (req, res) => {
    try {
        const { error } = rewardSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, points_cost } = req.body;
        const [result] = await req.db.query(
            'INSERT INTO rewards (name, points_cost) VALUES (?, ?)',
            [name, points_cost]
        );
        
        res.status(201).json({ id: result.insertId, name, points_cost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign reward to profile
router.post('/:id/assign', async (req, res) => {
    try {
        const { profileId, date } = req.body;
        const rewardId = req.params.id;

        const connection = await req.db.getConnection();
        try {
            await connection.beginTransaction();

            // Get reward details
            const [[reward]] = await connection.query(
                'SELECT * FROM rewards WHERE id = ?',
                [rewardId]
            );

            // Insert assignment
            await connection.query(
                'INSERT INTO reward_assignments (reward_id, profile_id, assigned_at) VALUES (?, ?, ?)',
                [rewardId, profileId, date]
            );

            // Update profile points
            await connection.query(
                'UPDATE profiles SET points = points - ? WHERE id = ?',
                [reward.points_cost, profileId]
            );

            await connection.commit();

            // Get updated profile data
            const [[profile]] = await connection.query(
                'SELECT * FROM profiles WHERE id = ?',
                [profileId]
            );

            res.json({
                reward_id: rewardId,
                profile_id: profileId,
                assigned_at: date,
                profile_points: profile.points
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

module.exports = router; 