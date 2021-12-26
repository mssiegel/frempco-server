import express from 'express';

import { getClassroom } from '../services/database.js';

const router = express.Router();

// @desc      Get a classroom's activation status
// @route     GET /api/v1/classrooms/:classroomName
router.get('/:classroomName', (req, res) => {
  const { classroomName } = req.params;
  const isActive = getClassroom(classroomName) !== undefined;
  res.status(200).json({ classroomName, isActive });
});

export default router;
