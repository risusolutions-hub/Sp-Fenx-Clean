import React, { useState, useEffect } from 'react';
import { Award, BookOpen, AlertCircle, Plus, Trash2 } from 'lucide-react';
import Loader from '../Loader';

export default function EngineerSkillsProfile({ engineerId, isEditable = false }) {
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    proficiencyLevel: 'intermediate',
    yearsOfExperience: 1
  });
  const [newCert, setNewCert] = useState({
    certificationName: '',
    issuingBody: '',
    issuedAt: '',
    expiresAt: ''
  });

  useEffect(() => {
    loadSkillsAndCerts();
  }, [engineerId]);

  const loadSkillsAndCerts = async () => {
    try {
      setLoading(true);
      const [skillsRes, certsRes] = await Promise.all([
        fetch(`/api/skills/engineers/${engineerId}/skills`, { credentials: 'include' }),
        fetch(`/api/skills/engineers/${engineerId}/certifications`, { credentials: 'include' })
      ]);

      const skillsData = await skillsRes.json();
      const certsData = await certsRes.json();

      if (skillsData.success) setSkills(skillsData.skills || []);
      if (certsData.success) setCertifications(certsData.certifications || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/skills/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          engineerId,
          ...newSkill
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSkills([...skills, data.skill]);
        setNewSkill({ skillName: '', proficiencyLevel: 'intermediate', yearsOfExperience: 1 });
        setShowSkillForm(false);
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/skills/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          engineerId,
          ...newCert
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCertifications([...certifications, data.certification]);
        setNewCert({ certificationName: '', issuingBody: '', issuedAt: '', expiresAt: '' });
        setShowCertForm(false);
      }
    } catch (error) {
      console.error('Error adding certification:', error);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      const response = await fetch(`/api/skills/skills/${skillId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setSkills(skills.filter(s => s.id !== skillId));
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      const response = await fetch(`/api/skills/certifications/${certId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setCertifications(certifications.filter(c => c.id !== certId));
      }
    } catch (error) {
      console.error('Error deleting certification:', error);
    }
  };

  if (loading) return <Loader />;

  const expiringCerts = certifications.filter(c => c.expiringIn30Days);
  const expiredCerts = certifications.filter(c => c.isExpired);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Skills & Certifications</h2>
          <p className="text-sm text-slate-500">Engineer qualifications and expertise</p>
        </div>
      </div>

      {/* Expiration Alerts */}
      {(expiringCerts.length > 0 || expiredCerts.length > 0) && (
        <div className="space-y-2">
          {expiringCerts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-yellow-900">Expiring Soon</p>
                <ul className="text-sm text-yellow-700 mt-1">
                  {expiringCerts.map(cert => (
                    <li key={cert.id}>{cert.certificationName}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {expiredCerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-red-900">Expired Certifications</p>
                <ul className="text-sm text-red-700 mt-1">
                  {expiredCerts.map(cert => (
                    <li key={cert.id}>{cert.certificationName}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            Technical Skills ({skills.length})
          </h3>
          {isEditable && (
            <button
              onClick={() => setShowSkillForm(!showSkillForm)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} /> Add Skill
            </button>
          )}
        </div>

        {showSkillForm && isEditable && (
          <form onSubmit={handleAddSkill} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Skill name (e.g., Electrical, Mechanical)"
                value={newSkill.skillName}
                onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newSkill.proficiencyLevel}
                onChange={(e) => setNewSkill({ ...newSkill, proficiencyLevel: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <input
                type="number"
                placeholder="Years of experience"
                value={newSkill.yearsOfExperience}
                onChange={(e) => setNewSkill({ ...newSkill, yearsOfExperience: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <button
                type="submit"
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Skill
              </button>
            </div>
          </form>
        )}

        {skills.length === 0 ? (
          <p className="text-slate-500 text-sm">No skills recorded yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skills.map(skill => (
              <div key={skill.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{skill.skillName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      skill.proficiencyLevel === 'expert' ? 'bg-purple-100 text-purple-700' :
                      skill.proficiencyLevel === 'advanced' ? 'bg-green-100 text-green-700' :
                      skill.proficiencyLevel === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {skill.proficiencyLevel.charAt(0).toUpperCase() + skill.proficiencyLevel.slice(1)}
                    </span>
                    {skill.yearsOfExperience && (
                      <span className="text-xs text-slate-600">{skill.yearsOfExperience} yrs</span>
                    )}
                  </div>
                </div>
                {isEditable && (
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications Section */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award size={20} className="text-amber-600" />
            Certifications ({certifications.length})
          </h3>
          {isEditable && (
            <button
              onClick={() => setShowCertForm(!showCertForm)}
              className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              <Plus size={16} /> Add Certification
            </button>
          )}
        </div>

        {showCertForm && isEditable && (
          <form onSubmit={handleAddCert} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Certification name"
                value={newCert.certificationName}
                onChange={(e) => setNewCert({ ...newCert, certificationName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <input
                type="text"
                placeholder="Issuing body"
                value={newCert.issuingBody}
                onChange={(e) => setNewCert({ ...newCert, issuingBody: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="date"
                placeholder="Issued at"
                value={newCert.issuedAt}
                onChange={(e) => setNewCert({ ...newCert, issuedAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <input
                type="date"
                placeholder="Expires at"
                value={newCert.expiresAt}
                onChange={(e) => setNewCert({ ...newCert, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="w-full px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                Add Certification
              </button>
            </div>
          </form>
        )}

        {certifications.length === 0 ? (
          <p className="text-slate-500 text-sm">No certifications recorded yet</p>
        ) : (
          <div className="space-y-2">
            {certifications.map(cert => (
              <div key={cert.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{cert.certificationName}</p>
                  {cert.issuingBody && (
                    <p className="text-sm text-slate-600">Issued by: {cert.issuingBody}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(cert.issuedAt).toLocaleDateString()} 
                    {cert.expiresAt && ` - ${new Date(cert.expiresAt).toLocaleDateString()}`}
                  </p>
                  {cert.expiringIn30Days && (
                    <p className="text-xs text-yellow-700 font-bold mt-1">Expiring soon</p>
                  )}
                  {cert.isExpired && (
                    <p className="text-xs text-red-700 font-bold mt-1">Expired</p>
                  )}
                </div>
                {isEditable && (
                  <button
                    onClick={() => handleDeleteCert(cert.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
