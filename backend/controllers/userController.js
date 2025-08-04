import { exec } from 'child_process';
import path from 'path';
import Person from '../models/userModel.js'; // or wherever your User/Person model is
import Company from '../models/Company.js'; 

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



