import express from 'express';
import {
    getPeople, enrichPerson, getEnrichedSnippets,
    getSearchLogs,
    createPerson
} from '../controllers/userController.js';

const router = express.Router();

// GET: List all people
router.get('/people', getPeople);

// POST: Trigger enrichment
router.post('/enrich/:id', enrichPerson);

router.get('/enriched-snippets', getEnrichedSnippets);
router.get('/search-logs', getSearchLogs);
router.post('/people', createPerson);


export default router;
