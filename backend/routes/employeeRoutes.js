const express = require('express');
const router = express.Router();
const { getAllEmployees, deleteEmployee } = require('../controllers/employeeController');

router.get('/', getAllEmployees);
router.delete('/:username', deleteEmployee);

module.exports = router;
