require('dotenv').config();
const { Complaint } = require('./src/models');

async function updateComplaints() {
  try {
    console.log('\n=== UPDATING COMPLAINTS TO CLOSED/COMPLETED ===\n');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get the first 8 complaints
    const complaints = await Complaint.findAll({
      limit: 8,
      order: [['createdAt', 'DESC']]
    });

    for (let i = 0; i < complaints.length; i++) {
      const complaint = complaints[i];
      
      // Alternate between closed and resolved
      const status = i % 2 === 0 ? 'closed' : 'resolved';
      const workStatus = 'completed';
      const closedAt = i < 4 ? today : yesterday;
      
      await complaint.update({
        status,
        workStatus,
        closedAt,
        resolvedAt: closedAt,
        solutionNotes: 'Service completed successfully. Machine tested and verified working properly.'
      });

      console.log(`✓ Updated ${complaint.complaintId}: status=${status}, workStatus=${workStatus}`);
    }

    console.log('\n✅ Complaints updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

updateComplaints();
