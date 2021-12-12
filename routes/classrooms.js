import express from 'express';

const router = express.Router();

const activeClassrooms = new Set();

// @desc      Get a classroom's activation status
// @route     GET /api/v1/classrooms/:classroomName
router.get('/:classroomName', (req, res) => {
  const { classroomName } = req.params;
  const isActive = activeClassrooms.has(classroomName);
  res.status(200).json({ classroomName, isActive });
});

// @desc      Activates a classroom
// @route     POST /api/v1/classrooms/:classroomName
router.post('/:classroomName', (req, res) => {
  const { classroomName } = req.params;
  activeClassrooms.add(classroomName);
  res.status(200).json({ classroomName, isActive: true });
});

// @desc      Deactivates a classroom
// @route     DELETE /api/v1/classrooms/:classroomName
router.delete('/:classroomName', (req, res) => {
  const { classroomName } = req.params;
  activeClassrooms.delete(classroomName);
  res.status(200).json({ classroomName, isActive: false });
});

export default router;
