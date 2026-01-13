require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, Customer, Machine, EngineerStatus } = require('./src/models');

async function seed(){
  try{
    console.log('Starting seed...');
    await User.sync();
    console.log('User table synced');
    await Customer.sync();
    console.log('Customer table synced');
    await Machine.sync();
    console.log('Machine table synced');
    await EngineerStatus.sync();
    console.log('EngineerStatus table synced');

    // Check if users exist
    const userCount = await User.count();
    if(userCount === 0){
      console.log('Seeding users...');
      await User.destroy({ where: {} });
      const users = [
        { name: 'Super Admin', email: 'superadmin@example.com', password: 'password', role: 'superadmin' },
        { name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'admin' },
        { name: 'Manager User', email: 'manager@example.com', password: 'password', role: 'manager' },
        { name: 'Engineer User', email: 'engineer@example.com', password: 'password', role: 'engineer' },
        { name: 'John Smith', email: 'john.smith@example.com', password: 'password', role: 'engineer' },
        { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', password: 'password', role: 'engineer' },
        { name: 'Mike Davis', email: 'mike.davis@example.com', password: 'password', role: 'engineer' },
        { name: 'Emily Wilson', email: 'emily.wilson@example.com', password: 'password', role: 'engineer' },
        { name: 'David Brown', email: 'david.brown@example.com', password: 'password', role: 'engineer' }
      ];

      for(const u of users){
        // Create user with password - beforeCreate hook will hash it automatically
        const user = await User.create({ 
          name: u.name, 
          email: u.email, 
          role: u.role, 
          passwordHash: u.password 
        });
        console.log('Created user:', u.email);

        if(u.role === 'engineer'){
          await EngineerStatus.create({ engineerId: user.id, status: 'free' });
        }
      }
    }

    // Check if customers exist
    const customerCount = await Customer.count();
    if(customerCount === 0){
      const customers = [
        { name: 'John Doe', company: 'ABC Corp', city: 'New York', contact: '1234567890' },
        { name: 'Jane Smith', company: 'XYZ Ltd', city: 'Los Angeles', contact: '0987654321' }
      ];

      for(const c of customers){
        await Customer.create(c);
      }
    }

    // Check if machines exist
    const machineCount = await Machine.count();
    if(machineCount === 0){
      const machines = [
        { model: 'Laser 1000', serialNumber: 'SN001', installationDate: '2023-01-01', warrantyAmc: '1 year warranty', customerId: 1 },
        { model: 'Laser 2000', serialNumber: 'SN002', installationDate: '2023-02-01', warrantyAmc: 'AMC till 2025', customerId: 2 }
      ];

      for(const m of machines){
        await Machine.create(m);
      }
    }

    console.log('Seeded successfully');
    process.exit(0);
  }catch(err){
    console.error('Seeding failed:', err.message);
    if(err.original) console.error('Database error:', err.original.message);
    process.exit(1);
  }
}

seed();
