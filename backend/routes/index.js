import express from 'express';
import {
    getPeople, enrichPerson, getEnrichedSnippets,
    getSearchLogs,
    createPerson,
    loginPerson,
    getSnippetWithLogs,
    getAllSnippetsWithLogs
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
router.get('/snippet-with-logs/:snippetId', getSnippetWithLogs);
router.get('/all-snippets-with-logs', getAllSnippetsWithLogs);

export default router;
