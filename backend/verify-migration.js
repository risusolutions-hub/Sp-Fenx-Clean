#!/usr/bin/env node
/**
 * Quick verification script for createdBy column
 */
require('dotenv').config();
const { sequelize } = require('./src/models');

async function verify() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    const result = await sequelize.query("DESCRIBE complaints;");
    const columns = result[0];
    
    const createdByCol = columns.find(col => col.Field === 'createdBy');
    
    if (createdByCol) {
      console.log('✓ createdBy column exists');
      console.log('  Type:', createdByCol.Type);
      console.log('  Null:', createdByCol.Null);
    } else {
      console.log('✗ createdBy column NOT found');
      console.log('\nAll columns:');
      columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verify();
