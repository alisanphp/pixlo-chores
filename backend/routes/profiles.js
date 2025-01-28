const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { format } = require('date-fns');

// Validation schema
const profileSchema = Joi.object({
    name: Joi.string().required(),
    role: Joi.string().required(),
    color_theme: Joi.string().required(),
    points: Joi.number().default(0),
    icon_name: Joi.string().required()
});

// Get all profiles with their chores
router.get('/', async (req, res) => {
    try {
        const selectedDate = req.query.date;
        const dayOfWeek = format(new Date(selectedDate), 'EEE').toUpperCase();

        // Get all profiles
        const [profiles] = await req.db.query('SELECT * FROM profiles');

        // Get chores for the selected date
        const [chores] = await req.db.query(`
            SELECT 
                c.*,
                ca.profile_id,
                ca.is_completed,
                ca.completed_at,
                ca.assignment_date,
                cp.profile_id as assigned_profile_id
            FROM chores c
            INNER JOIN chore_profiles cp ON c.id = cp.chore_id
            LEFT JOIN chore_assignments ca ON c.id = ca.chore_id 
                AND ca.assignment_date = ?
                AND ca.profile_id = cp.profile_id
            WHERE 
                -- Tek seferlik görevler
                (c.is_repeat = FALSE AND c.repeat_start_date = ?)
                OR
                -- Günlük tekrar eden görevler
                (c.is_repeat = TRUE 
                 AND c.repeat_interval = 'daily'
                 AND c.repeat_start_date <= ?
                 AND (c.repeat_until IS NULL OR c.repeat_until >= ?))
                OR
                -- Haftalık tekrar eden görevler
                (c.is_repeat = TRUE 
                 AND c.repeat_interval = 'weekly'
                 AND c.repeat_start_date <= ?
                 AND (c.repeat_until IS NULL OR c.repeat_until >= ?)
                 AND JSON_CONTAINS(c.repeat_days, ?))
                OR
                -- Aylık tekrar eden görevler
                (c.is_repeat = TRUE 
                 AND c.repeat_interval = 'monthly'
                 AND c.repeat_start_date <= ?
                 AND (c.repeat_until IS NULL OR c.repeat_until >= ?)
                 AND DAY(c.repeat_start_date) = DAY(?))
            ORDER BY c.id, cp.profile_id
        `, [
            selectedDate, // assignments için
            selectedDate, // tek seferlik
            selectedDate, selectedDate, // günlük
            selectedDate, selectedDate, // haftalık
            JSON.stringify(dayOfWeek),
            selectedDate, selectedDate, selectedDate // aylık
        ]);

        // Group chores by profile
        const profilesWithChores = profiles.map(profile => ({
            ...profile,
            chores: chores
                .filter(chore => chore.assigned_profile_id === profile.id)
                .map(chore => ({
                    ...chore,
                    is_completed: chore.is_completed === 1
                }))
        }));

        res.json(profilesWithChores);
    } catch (error) {
        console.error('Error fetching profiles with chores:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new profile
router.post('/', async (req, res) => {
    try {
        const { error } = profileSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, role, color_theme, icon_name, points = 0 } = req.body;
        const [result] = await req.db.query(
            'INSERT INTO profiles (name, role, color_theme, points, icon_name) VALUES (?, ?, ?, ?, ?)',
            [name, role, color_theme, points, icon_name]
        );
        
        res.status(201).json({
            id: result.insertId,
            name,
            role,
            color_theme,
            icon_name,
            points
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update profile
router.put('/:id', async (req, res) => {
    try {
        const { error } = profileSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, role, color_theme, icon_name } = req.body;
        const profileId = req.params.id;

        const [result] = await req.db.query(
            'UPDATE profiles SET name = ?, role = ?, color_theme = ?, icon_name = ? WHERE id = ?',
            [name, role, color_theme, icon_name, profileId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            id: profileId,
            name,
            role,
            color_theme,
            icon_name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 