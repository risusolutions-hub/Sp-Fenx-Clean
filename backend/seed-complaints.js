require('dotenv').config();
const { sequelize, User, Customer, Machine, Complaint } = require('./src/models');

async function seedComplaints() {
  try {
    console.log('Starting complaint seed...');
    
    // Sync all models
    await sequelize.sync();
    console.log('Database synced');

    // Get or create test data
    const customers = await Customer.findAll();
    if (customers.length === 0) {
      console.log('Creating test customers...');
      await Customer.create({ 
        name: 'ABC Corp', 
        company: 'ABC Corporation', 
        city: 'New York', 
        contact: '1234567890' 
      });
      await Customer.create({ 
        name: 'XYZ Ltd', 
        company: 'XYZ Limited', 
        city: 'Los Angeles', 
        contact: '0987654321' 
      });
    }

    const machines = await Machine.findAll();
    if (machines.length === 0) {
      console.log('Creating test machines...');
      await Machine.create({
        model: 'Fiber 30W',
        serialNumber: 'FBR-001',
        installationDate: '2023-01-15',
        customerId: 1
      });
      await Machine.create({
        model: 'CO2 100W',
        serialNumber: 'CO2-001',
        installationDate: '2023-02-20',
        customerId: 2
      });
    }

    const engineers = await User.findAll({ where: { role: 'engineer' } });
    if (engineers.length === 0) {
      console.log('Creating test engineer...');
      await User.create({
        name: 'John Engineer',
        email: 'engineer@example.com',
        passwordHash: 'password',
        role: 'engineer'
      });
    }

    // Create sample complaints with closed/completed status
    const existingComplaints = await Complaint.count();
    if (existingComplaints === 0) {
      console.log('Creating sample closed/completed complaints...');
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      // Get first engineer
      const engineer = await User.findOne({ where: { role: 'engineer' } });

      const complaints = [
        {
          complaintId: 'TKT-' + Date.now(),
          problem: 'Laser beam not cutting properly',
          priority: 'high',
          status: 'closed',
          workStatus: 'completed',
          solutionNotes: 'Replaced laser tube and realigned optics. Machine now working at 100% efficiency.',
          customerId: 1,
          machineId: 1,
          assignedTo: engineer?.id,
          issueCategories: ['mechanical', 'alignment'],
          sparesUsed: JSON.stringify([
            { name: 'Laser Tube', partName: 'LT-100', quantity: 1 },
            { name: 'Mirror Assembly', partName: 'MIR-45', quantity: 1 }
          ]),
          closedAt: today,
          resolvedAt: today,
          createdBy: 1
        },
        {
          complaintId: 'TKT-' + (Date.now() + 1),
          problem: 'Machine making strange noise during operation',
          priority: 'medium',
          status: 'resolved',
          workStatus: 'completed',
          solutionNotes: 'Serviced the cooling fan and replaced bearings. Noise eliminated.',
          customerId: 2,
          machineId: 2,
          assignedTo: engineer?.id,
          issueCategories: ['mechanical', 'maintenance'],
          sparesUsed: JSON.stringify([
            { name: 'Cooling Fan', partName: 'FAN-55', quantity: 1 },
            { name: 'Bearing Set', partName: 'BRG-20', quantity: 2 }
          ]),
          resolvedAt: yesterday,
          createdBy: 1
        },
        {
          complaintId: 'TKT-' + (Date.now() + 2),
          problem: 'Software calibration issue',
          priority: 'low',
          status: 'closed',
          workStatus: 'completed',
          solutionNotes: 'Updated firmware to v2.5.1 and recalibrated all sensors.',
          customerId: 1,
          machineId: 1,
          assignedTo: engineer?.id,
          issueCategories: ['software'],
          sparesUsed: JSON.stringify([]),
          closedAt: twoDaysAgo,
          createdBy: 1
        },
        {
          complaintId: 'TKT-' + (Date.now() + 3),
          problem: 'Power supply malfunction',
          priority: 'critical',
          status: 'closed',
          workStatus: 'completed',
          solutionNotes: 'Replaced entire power supply unit. Machine tested and verified.',
          customerId: 2,
          machineId: 2,
          assignedTo: engineer?.id,
          issueCategories: ['electrical'],
          sparesUsed: JSON.stringify([
            { name: 'Power Supply Unit', partName: 'PSU-200', quantity: 1 }
          ]),
          closedAt: today,
          createdBy: 1
        }
      ];

      for (const complaint of complaints) {
        const created = await Complaint.create(complaint);
        console.log('✓ Created:', created.complaintId, '-', created.status, '/', created.workStatus);
      }

      console.log('\n✅ Sample complaints created successfully!');
    } else {
      console.log(`ℹ️  Database already has ${existingComplaints} complaints. Skipping creation.`);
    }

    console.log('✅ Complaint seed completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    if (err.original) console.error('Database error:', err.original.message);
    console.error(err.stack);
    process.exit(1);
  }
}

seedComplaints();
