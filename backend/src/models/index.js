const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user')(sequelize);
const Customer = require('./customer')(sequelize);
const Machine = require('./machine')(sequelize);
const Complaint = require('./complaint')(sequelize);
const ServiceHistory = require('./serviceHistory')(sequelize);
const EngineerStatus = require('./engineerStatus')(sequelize);
const Leave = require('./leave')(sequelize);
const DailyWorkTime = require('./dailyWorkTime')(sequelize);
const Message = require('./message')(sequelize);
const EngineerSkill = require('./engineerSkill')(sequelize);
const Certification = require('./certification')(sequelize);
const MachineServiceHistory = require('./machineServiceHistory')(sequelize);
const ServiceChecklist = require('./serviceChecklist')(sequelize);
const DuplicateComplaint = require('./duplicateComplaint')(sequelize);
const DashboardWidget = require('./dashboardWidget')(sequelize);
const Settings = require('./settings')(sequelize);
const AuditLog = require('./auditLog')(sequelize);
const ApiLog = require('./apiLog')(sequelize);
const SystemConfig = require('./systemConfig')(sequelize);
const LoginSession = require('./loginSession')(sequelize);

// Associations
Customer.hasMany(Machine, { foreignKey: 'customerId' });
Machine.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.hasMany(Complaint, { foreignKey: 'customerId' });
Complaint.belongsTo(Customer, { foreignKey: 'customerId' });

Machine.hasMany(Complaint, { foreignKey: 'machineId' });
Complaint.belongsTo(Machine, { foreignKey: 'machineId' });

User.hasMany(Complaint, { foreignKey: 'assignedTo', as: 'assignedComplaints' });
Complaint.belongsTo(User, { foreignKey: 'assignedTo', as: 'engineer' });

Complaint.hasMany(ServiceHistory, { foreignKey: 'complaintId' });
ServiceHistory.belongsTo(Complaint, { foreignKey: 'complaintId' });

User.hasMany(ServiceHistory, { foreignKey: 'engineerId' });
ServiceHistory.belongsTo(User, { foreignKey: 'engineerId' });

User.hasOne(EngineerStatus, { foreignKey: 'engineerId' });
EngineerStatus.belongsTo(User, { foreignKey: 'engineerId' });

User.hasMany(Leave, { foreignKey: 'engineerId', as: 'leaveRequests' });
Leave.belongsTo(User, { foreignKey: 'engineerId', as: 'engineer' });

Leave.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver', constraints: false });

User.hasMany(DailyWorkTime, { foreignKey: 'engineerId', as: 'workHistory' });
DailyWorkTime.belongsTo(User, { foreignKey: 'engineerId', as: 'engineer' });

// Messaging associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

Complaint.hasMany(Message, { foreignKey: 'complaintId', as: 'messages' });
Message.belongsTo(Complaint, { foreignKey: 'complaintId' });

// Engineer Skills and Certifications
User.hasMany(EngineerSkill, { foreignKey: 'engineerId', as: 'skills' });
EngineerSkill.belongsTo(User, { foreignKey: 'engineerId' });

User.hasMany(Certification, { foreignKey: 'engineerId', as: 'certifications' });
Certification.belongsTo(User, { foreignKey: 'engineerId' });

// Machine Service History
Machine.hasMany(MachineServiceHistory, { foreignKey: 'machineId', as: 'serviceHistory' });
MachineServiceHistory.belongsTo(Machine, { foreignKey: 'machineId' });

Complaint.hasOne(MachineServiceHistory, { foreignKey: 'complaintId' });
MachineServiceHistory.belongsTo(Complaint, { foreignKey: 'complaintId' });

User.hasMany(MachineServiceHistory, { foreignKey: 'engineerId', as: 'servicesPerformed' });
MachineServiceHistory.belongsTo(User, { foreignKey: 'engineerId', as: 'engineer' });

// Service Checklists
Complaint.hasOne(ServiceChecklist, { foreignKey: 'complaintId' });
ServiceChecklist.belongsTo(Complaint, { foreignKey: 'complaintId' });

User.hasMany(ServiceChecklist, { foreignKey: 'completedByEngineerId', as: 'completedChecklists' });
ServiceChecklist.belongsTo(User, { foreignKey: 'completedByEngineerId', as: 'completedBy' });

// Duplicate Complaints
Complaint.hasMany(DuplicateComplaint, { foreignKey: 'primaryComplaintId', as: 'duplicates' });

// Dashboard Widgets
User.hasMany(DashboardWidget, { foreignKey: 'userId', as: 'dashboardLayouts' });
DashboardWidget.belongsTo(User, { foreignKey: 'userId' });

// Audit Logs - no strict FK constraint to allow logging even if user is deleted
// userName is cached in the log entry for historical reference

// Associations for login sessions
User.hasMany(LoginSession, { foreignKey: 'userId', as: 'loginSessions' });
LoginSession.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Customer,
  Machine,
  Complaint,
  ServiceHistory,
  EngineerStatus,
  Leave,
  DailyWorkTime,
  Message,
  EngineerSkill,
  Certification,
  MachineServiceHistory,
  ServiceChecklist,
  DuplicateComplaint,
  DashboardWidget,
  Settings,
  AuditLog,
  ApiLog,
  SystemConfig,
  LoginSession
};

