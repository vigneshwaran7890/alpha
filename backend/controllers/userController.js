import { exec } from 'child_process';
import path from 'path';
import bcrypt from 'bcrypt';
import Person from '../models/userModel.js'; // or wherever your User/Person model is
import Company from '../models/Company.js'; 
import ContextSnippet from '../models/ContextSnippet.js'; // adjust path as needed
import SearchLog from '../models/SearchLog.js'; // adjust path as needed

// GET /api/people
export const getPeople = async (req, res) => {
  try {
    const people = await Person.find().populate('company_id');
    res.json(people);
  } catch (err) {
    console.error('❌ Error fetching people:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/enrich/:id
export const enrichPerson = async (req, res) => {
  const personId = req.params.id;
  const scriptPath = path.resolve('agents/agent.py');

  exec(`python ${scriptPath} ${personId}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Agent error: ${error.message}`);
      return res.status(500).json({ message: 'Agent failed to run', error: error.message });
    }

    if (stderr) console.warn(`⚠️ Agent stderr: ${stderr}`);
    console.log(`✅ Agent stdout: ${stdout}`);

    res.json({ message: 'Agent executed successfully', output: stdout });
  });
};

// GET /api/enriched-snippets
export const getEnrichedSnippets = async (req, res) => {
  try {
    const snippets = await ContextSnippet.find();
    res.json(snippets);
  } catch (err) {
    console.error('❌ Error fetching enriched snippets:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/search-logs
export const getSearchLogs = async (req, res) => {
  try {
    const logs = await SearchLog.find();
    res.json(logs);
  } catch (err) {
    console.error('❌ Error fetching search logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/people
export const createPerson = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    const person = new Person({
      ...rest,
      password: hashedPassword,
    });

    await person.save();
    res.status(201).json({
      message: 'Person created successfully',
      person: {
        id: person._id,
        full_name: person.full_name,
        email: person.email,
        // never return the password!
      },
    });
  } catch (err) {
    console.error('❌ Error creating person:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/login
export const loginPerson = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const person = await Person.findOne({ email });
    if (!person) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, person.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      person: {
        id: person._id,
        name: person.name,
        full_name: person.full_name,
        email: person.email,
      },
    });
  } catch (err) {
    console.error('❌ Error logging in:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/snippet-with-logs/:snippetId
export const getSnippetWithLogs = async (req, res) => {
  try {
    const snippetId = req.params.snippetId;
    const snippet = await ContextSnippet.findOne({ _id: snippetId });
    if (!snippet) {
      return res.status(404).json({ message: 'Context snippet not found' });
    }
    const logs = await SearchLog.find({ context_snippet_id: snippetId });
    res.json({ context_snippet: snippet, search_logs: logs });
  } catch (err) {
    console.error('❌ Error fetching snippet with logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



