import express from 'express';
import {
    getPeople, enrichPerson, getEnrichedSnippets,
    getSearchLogs,
    createPerson,
    loginPerson,
    getSnippetWithLogs
} from '../controllers/userController.js';

const router = express.Router();

// GET: List all people
router.get('/people', getPeople);

// POST: Trigger enrichment
router.post('/enrich/:id', enrichPerson);

router.get('/enriched-snippets', getEnrichedSnippets);
router.get('/search-logs', getSearchLogs);
router.post('/people', createPerson);
router.post('/login', loginPerson);
router.get('/api/snippet-with-logs/:snippetId', getSnippetWithLogs);


export default router;
