require('dotenv').config();
const { Complaint, Customer, Machine, User } = require('./src/models');

async function checkComplaints() {
  try {
    console.log('\n=== CHECKING COMPLAINTS DATABASE ===\n');

    const complaints = await Complaint.findAll({
      include: [Customer, Machine, { model: User, as: 'engineer' }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Total complaints in database: ${complaints.length}\n`);

    complaints.forEach((c, i) => {
      console.log(`${i + 1}. ${c.complaintId}`);
      console.log(`   Status: ${c.status}`);
      console.log(`   Work Status: ${c.workStatus}`);
      console.log(`   Priority: ${c.priority}`);
      console.log(`   Problem: ${c.problem?.substring(0, 50)}...`);
      console.log(`   Customer: ${c.Customer?.name || 'N/A'}`);
      console.log(`   Machine: ${c.Machine?.model || 'N/A'}`);
      console.log(`   Engineer: ${c.engineer?.name || 'Unassigned'}`);
      console.log(`   Created: ${c.createdAt?.toLocaleDateString()}`);
      console.log(`   Closed: ${c.closedAt?.toLocaleDateString() || 'N/A'}`);
      console.log('');
    });

    const closedCount = complaints.filter(c => c.status === 'closed').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
    const completedCount = complaints.filter(c => c.workStatus === 'completed').length;
    const shouldShow = complaints.filter(c => 
      c.status === 'closed' || c.status === 'resolved' || c.workStatus === 'completed'
    ).length;

    console.log('=== SUMMARY ===');
    console.log(`Closed: ${closedCount}`);
    console.log(`Resolved: ${resolvedCount}`);
    console.log(`Completed (workStatus): ${completedCount}`);
    console.log(`Should appear in Service History: ${shouldShow}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkComplaints();
