import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Campaign from './models/Campaign.js';
import Company from './models/Company.js';
import Person from './models/userModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional)
        await Campaign.deleteMany();
        await Company.deleteMany();
        await Person.deleteMany();

        // Create Campaign
        const campaign = await Campaign.create({
            name: 'Alpha Outreach Campaign',
        });

        // Create Company
        const company = await Company.create({
            campaign_id: campaign._id,
            name: 'InnovateX Inc.',
            domain: 'innovatex.com',
        });

        // Create People
        await Person.create([
            {
                company_id: company._id,
                name: 'Jane Doe',
                password: 'securepassword123',
                role: 'admin',
                email: 'jane@innovatex.com',
                title: 'CTO',
            },
            {
                company_id: company._id,
                name: 'John Smith',
                email: 'john@innovatex.com',
                password: 'securepassword123',
                title: 'Head of Product',
            },
        ]);
        console.log('🌱 Seed data created!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};

seedData();
