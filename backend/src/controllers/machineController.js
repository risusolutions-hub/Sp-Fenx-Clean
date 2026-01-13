const { Machine, Customer } = require('../models');

async function listMachines(req, res){
  const machines = await Machine.findAll({ include: Customer });
  res.json({ machines });
}

async function createMachine(req, res){
  const { model, serialNumber, installationDate, warrantyAmc, customerId } = req.body;
  if(!model || !serialNumber || !installationDate || !customerId) return res.status(400).json({ error: 'Missing fields' });

  try{
    const machine = await Machine.create({ model, serialNumber, installationDate, warrantyAmc, customerId });
    res.status(201).json(machine);
  }catch(err){
    res.status(400).json({ error: err.message });
  }
}

async function updateMachine(req, res){
  const { id } = req.params;
  const machine = await Machine.findByPk(id);
  if(!machine) return res.status(404).json({ error: 'Not found' });

  const { model, serialNumber, installationDate, warrantyAmc, customerId } = req.body;
  if(model) machine.model = model;
  if(serialNumber) machine.serialNumber = serialNumber;
  if(installationDate) machine.installationDate = installationDate;
  if(warrantyAmc !== undefined) machine.warrantyAmc = warrantyAmc;
  if(customerId) machine.customerId = customerId;
  await machine.save();
  res.json(machine);
}

async function deleteMachine(req, res){
  const { id } = req.params;
  const machine = await Machine.findByPk(id);
  if(!machine) return res.status(404).json({ error: 'Not found' });

  await machine.destroy();
  res.json({ ok: true });
}

module.exports = { listMachines, createMachine, updateMachine, deleteMachine };