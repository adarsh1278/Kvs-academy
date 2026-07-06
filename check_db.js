const fs = require('fs');
const path = require('path');

// Parse .env manually
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error('Error loading .env file:', e);
}

const { connectToDatabase } = require('./src/lib/db');
const { Class } = require('./src/models/Class');
const { Section } = require('./src/models/Section');
const { Subject } = require('./src/models/Subject');
const { Teacher } = require('./src/models/Teacher');
const { User } = require('./src/models/User');

async function main() {
  await connectToDatabase();
  const classes = await Class.find({});
  console.log('--- CLASSES ---');
  classes.forEach(c => console.log(`id: ${c._id.toString()}, name: ${c.name}`));
  
  const sections = await Section.find({}).populate('class');
  console.log('--- SECTIONS ---');
  sections.forEach(s => console.log(`id: ${s._id.toString()}, name: ${s.name}, class: ${s.class?.name} (${s.class?._id?.toString()})`));
  
  const subjects = await Subject.find({});
  console.log('--- SUBJECTS ---');
  subjects.forEach(sub => console.log(`id: ${sub._id.toString()}, name: ${sub.name}, code: ${sub.code}`));

  const teachers = await Teacher.find({}).populate('user');
  console.log('--- TEACHERS ---');
  teachers.forEach(t => console.log(`id: ${t._id.toString()}, userId: ${t.user?._id?.toString()}, name: ${t.user?.name}`));
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
