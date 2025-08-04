import express from 'express';
import { getPeople, enrichPerson } from '../controllers/userController.js';

const router = express.Router();

// GET: List all people
router.get('/people', getPeople);

// POST: Trigger enrichment
router.post('/enrich/:id', enrichPerson);



export default router;
