import React, { useState, useEffect } from 'react';
import { Award, BookOpen, AlertCircle, Plus, Trash2, Edit2, CheckCircle, Clock, User, Star, TrendingUp, Shield } from 'lucide-react';
import api from '../../api';

export default function SkillsManagementView({ currentUser }) {
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editingCert, setEditingCert] = useState(null);
  const [skillForm, setSkillForm] = useState({
    skillName: '',
    skillCategory: 'mechanical',
    proficiencyLevel: 'intermediate',
    yearsOfExperience: 1
  });
  const [certForm, setCertForm] = useState({
    certificationName: '',
    issuingBody: '',
    certificateNumber: '',
    issuedAt: '',
    expiresAt: ''
  });

  const skillCategories = [
    { value: 'mechanical', label: 'Mechanical', icon: '⚙️' },
    { value: 'electrical', label: 'Electrical', icon: '⚡' },
    { value: 'network', label: 'Network', icon: '🌐' },
    { value: 'software', label: 'Software', icon: '💻' },
    { value: 'laser', label: 'Laser Systems', icon: '🔴' },
    { value: 'optics', label: 'Optics', icon: '🔬' },
    { value: 'safety', label: 'Safety', icon: '🛡️' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const proficiencyLevels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-slate-100 text-slate-700' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-700' },
    { value: 'advanced', label: 'Advanced', color: 'bg-green-100 text-green-700' },
    { value: 'expert', label: 'Expert', color: 'bg-purple-100 text-purple-700' }
  ];

  useEffect(() => {
    loadEngineers();
  }, []);

  useEffect(() => {
    if (selectedEngineer) {
      loadSkillsAndCerts(selectedEngineer.id);
    }
  }, [selectedEngineer]);

  const loadEngineers = async () => {
    try {
      const res = await api.get('/users');
      const engineerList = (res.data.users || []).filter(u => u.role === 'engineer');
      setEngineers(engineerList);
      
      // If current user is an engineer, auto-select them
      if (currentUser?.role === 'engineer') {
        const self = engineerList.find(e => e.id === currentUser.id);
        if (self) setSelectedEngineer(self);
      } else if (engineerList.length > 0) {
        setSelectedEngineer(engineerList[0]);
      }
    } catch (error) {
      console.error('Error loading engineers:', error);
    }
  };

  const loadSkillsAndCerts = async (engineerId) => {
    try {
      setLoading(true);
      const [skillsRes, certsRes] = await Promise.all([
        api.get(`/skills/engineers/${engineerId}/skills`),
        api.get(`/skills/engineers/${engineerId}/certifications`)
      ]);
      setSkills(skillsRes.data.skills || []);
      setCertifications(certsRes.data.certifications || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/skills/skills', {
        engineerId: selectedEngineer.id,
        ...skillForm
      });
      setSkills([...skills, res.data.skill]);
      setSkillForm({ skillName: '', skillCategory: 'mechanical', proficiencyLevel: 'intermediate', yearsOfExperience: 1 });
      setShowSkillForm(false);
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/skills/skills/${editingSkill.id}`, skillForm);
      setSkills(skills.map(s => s.id === editingSkill.id ? res.data.skill : s));
      setEditingSkill(null);
      setSkillForm({ skillName: '', skillCategory: 'mechanical', proficiencyLevel: 'intermediate', yearsOfExperience: 1 });
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await api.delete(`/skills/skills/${skillId}`);
      setSkills(skills.filter(s => s.id !== skillId));
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/skills/certifications', {
        engineerId: selectedEngineer.id,
        ...certForm
      });
      setCertifications([...certifications, res.data.certification]);
      setCertForm({ certificationName: '', issuingBody: '', certificateNumber: '', issuedAt: '', expiresAt: '' });
      setShowCertForm(false);
    } catch (error) {
      console.error('Error adding certification:', error);
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      await api.delete(`/skills/certifications/${certId}`);
      setCertifications(certifications.filter(c => c.id !== certId));
    } catch (error) {
      console.error('Error deleting certification:', error);
    }
  };

  const startEditSkill = (skill) => {
    setEditingSkill(skill);
    setSkillForm({
      skillName: skill.skillName,
      skillCategory: skill.skillCategory || 'mechanical',
      proficiencyLevel: skill.proficiencyLevel,
      yearsOfExperience: skill.yearsOfExperience
    });
  };

  const getProficiencyColor = (level) => {
    return proficiencyLevels.find(l => l.value === level)?.color || 'bg-slate-100 text-slate-700';
  };

  const getCategoryIcon = (category) => {
    return skillCategories.find(c => c.value === category)?.icon || '📋';
  };

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const expiry = new Date(date);
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return expiry - now < thirtyDays && expiry > now;
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const expiringCerts = certifications.filter(c => isExpiringSoon(c.expiresAt));
  const expiredCerts = certifications.filter(c => isExpired(c.expiresAt));

  const canEdit = currentUser?.role !== 'engineer' || selectedEngineer?.id === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award size={24} className="text-blue-600" />
            Skills & Certifications
          </h2>
          <p className="text-sm text-slate-500">Manage engineer qualifications and expertise</p>
        </div>
      </div>

      {/* Engineer Selector (for managers/admins) */}
      {currentUser?.role !== 'engineer' && (
        <div className="flex gap-3 flex-wrap">
          {engineers.map(eng => (
            <button
              key={eng.id}
              onClick={() => setSelectedEngineer(eng)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                selectedEngineer?.id === eng.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                selectedEngineer?.id === eng.id ? 'bg-blue-500' : 'bg-slate-200'
              }`}>
                {eng.name?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{eng.name}</span>
            </button>
          ))}
        </div>
      )}

      {selectedEngineer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Section */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                Technical Skills
              </h3>
              {canEdit && (
                <button
                  onClick={() => setShowSkillForm(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1"
                >
                  <Plus size={16} /> Add Skill
                </button>
              )}
            </div>

            {/* Skill Form */}
            {(showSkillForm || editingSkill) && (
              <form onSubmit={editingSkill ? handleUpdateSkill : handleAddSkill} className="p-4 border-b border-slate-200 bg-blue-50">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Skill name"
                    value={skillForm.skillName}
                    onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                    className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                  <select
                    value={skillForm.skillCategory}
                    onChange={(e) => setSkillForm({ ...skillForm, skillCategory: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {skillCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                  <select
                    value={skillForm.proficiencyLevel}
                    onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {proficiencyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                  <div className="col-span-2 flex items-center gap-2">
                    <label className="text-sm text-slate-600">Years of Experience:</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={skillForm.yearsOfExperience}
                      onChange={(e) => setSkillForm({ ...skillForm, yearsOfExperience: parseInt(e.target.value) })}
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    {editingSkill ? 'Update' : 'Add'} Skill
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSkillForm(false); setEditingSkill(null); }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Skills List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-slate-400">Loading...</div>
              ) : skills.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Star size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No skills recorded</p>
                </div>
              ) : (
                skills.map(skill => (
                  <div key={skill.id} className="p-3 bg-slate-50 rounded-lg flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(skill.skillCategory)}</span>
                        <span className="font-medium text-slate-900">{skill.skillName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getProficiencyColor(skill.proficiencyLevel)}`}>
                          {skill.proficiencyLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {skill.yearsOfExperience} years experience • {skill.skillCategory}
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <button onClick={() => startEditSkill(skill)} className="p-1.5 hover:bg-slate-200 rounded transition">
                          <Edit2 size={14} className="text-slate-500" />
                        </button>
                        <button onClick={() => handleDeleteSkill(skill.id)} className="p-1.5 hover:bg-red-100 rounded transition">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield size={18} className="text-green-500" />
                Certifications
              </h3>
              {canEdit && (
                <button
                  onClick={() => setShowCertForm(true)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-1"
                >
                  <Plus size={16} /> Add Cert
                </button>
              )}
            </div>

            {/* Expiration Alerts */}
            {(expiringCerts.length > 0 || expiredCerts.length > 0) && (
              <div className="p-3 space-y-2 border-b border-slate-200">
                {expiredCerts.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-900">Expired ({expiredCerts.length})</p>
                      <p className="text-xs text-red-700">{expiredCerts.map(c => c.certificationName).join(', ')}</p>
                    </div>
                  </div>
                )}
                {expiringCerts.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <Clock size={16} className="text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-yellow-900">Expiring Soon ({expiringCerts.length})</p>
                      <p className="text-xs text-yellow-700">{expiringCerts.map(c => c.certificationName).join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cert Form */}
            {showCertForm && (
              <form onSubmit={handleAddCert} className="p-4 border-b border-slate-200 bg-green-50">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Certification name"
                    value={certForm.certificationName}
                    onChange={(e) => setCertForm({ ...certForm, certificationName: e.target.value })}
                    className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Issuing body"
                    value={certForm.issuingBody}
                    onChange={(e) => setCertForm({ ...certForm, issuingBody: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Certificate number"
                    value={certForm.certificateNumber}
                    onChange={(e) => setCertForm({ ...certForm, certificateNumber: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <div>
                    <label className="text-xs text-slate-500">Issue Date</label>
                    <input
                      type="date"
                      value={certForm.issuedAt}
                      onChange={(e) => setCertForm({ ...certForm, issuedAt: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Expiry Date</label>
                    <input
                      type="date"
                      value={certForm.expiresAt}
                      onChange={(e) => setCertForm({ ...certForm, expiresAt: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                    Add Certification
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCertForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Certs List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-slate-400">Loading...</div>
              ) : certifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Shield size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No certifications recorded</p>
                </div>
              ) : (
                certifications.map(cert => (
                  <div 
                    key={cert.id} 
                    className={`p-3 rounded-lg flex items-start justify-between ${
                      isExpired(cert.expiresAt) ? 'bg-red-50 border border-red-200' :
                      isExpiringSoon(cert.expiresAt) ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-slate-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Award size={16} className={
                          isExpired(cert.expiresAt) ? 'text-red-500' :
                          isExpiringSoon(cert.expiresAt) ? 'text-yellow-500' :
                          'text-green-500'
                        } />
                        <span className="font-medium text-slate-900">{cert.certificationName}</span>
                        {cert.isVerified && (
                          <CheckCircle size={14} className="text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {cert.issuingBody && `${cert.issuingBody} • `}
                        {cert.certificateNumber && `#${cert.certificateNumber}`}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        {cert.issuedAt && (
                          <span className="text-slate-500">
                            Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                          </span>
                        )}
                        {cert.expiresAt && (
                          <span className={
                            isExpired(cert.expiresAt) ? 'text-red-600 font-bold' :
                            isExpiringSoon(cert.expiresAt) ? 'text-yellow-600 font-bold' :
                            'text-slate-500'
                          }>
                            {isExpired(cert.expiresAt) ? 'Expired' : 'Expires'}: {new Date(cert.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <button onClick={() => handleDeleteCert(cert.id)} className="p-1.5 hover:bg-red-100 rounded transition">
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skills Summary by Category */}
      {skills.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            Skills Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skillCategories.map(cat => {
              const categorySkills = skills.filter(s => s.skillCategory === cat.value);
              if (categorySkills.length === 0) return null;
              return (
                <div key={cat.value} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium text-slate-900">{cat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{categorySkills.length}</p>
                  <p className="text-xs text-slate-500">skills</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
