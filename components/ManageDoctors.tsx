
import React, { useState } from 'react';
import { DoctorProfile, ChildProfile } from '../types';
import { StethoscopeIcon, PlusCircleIcon, SaveIcon, TrashIcon, EditIcon, XIcon, LinkIcon } from './Icons';

interface ManageDoctorsProps {
  doctorProfiles: DoctorProfile[];
  childProfiles: ChildProfile[];
  onAdd: (data: Omit<DoctorProfile, 'id' | 'linkCode'>) => void;
  onUpdate: (data: DoctorProfile) => void;
  onDelete: (id: number) => void;
  onLink: (childId: number, doctorId: number) => void;
  onUnlink: (childId: number) => void;
}

const EMPTY_DOCTOR: Omit<DoctorProfile, 'id' | 'linkCode'> = { name: '', specialty: '' };

const DoctorForm: React.FC<{
  doctor: DoctorProfile | Omit<DoctorProfile, 'id' | 'linkCode'>;
  onSave: (data: DoctorProfile | Omit<DoctorProfile, 'id' | 'linkCode'>) => void;
  onCancel: () => void;
}> = ({ doctor, onSave, onCancel }) => {
  const [formData, setFormData] = useState(doctor);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.specialty) {
      onSave(formData);
    }
  };

  const isEditing = 'id' in doctor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full m-4">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}</h3>
          <button onClick={onCancel} className="p-1 rounded-full hover:bg-slate-100"><XIcon className="w-6 h-6 text-slate-500"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="اسم الطبيب" name="name" value={formData.name} onChange={handleChange} required />
          <FormInput label="التخصص" name="specialty" value={formData.specialty} onChange={handleChange} required />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onCancel} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-semibold hover:bg-slate-200">إلغاء</button>
            <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 flex items-center gap-2">
              <SaveIcon className="w-5 h-5"/>
              <span>حفظ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageLinksModal: React.FC<{
  doctor: DoctorProfile;
  childProfiles: ChildProfile[];
  onLink: (childId: number, doctorId: number) => void;
  onUnlink: (childId: number) => void;
  onClose: () => void;
}> = ({ doctor, childProfiles, onLink, onUnlink, onClose }) => {
  const linkedChildren = childProfiles.filter(c => c.linkedDoctorId === doctor.id);
  const unlinkedChildren = childProfiles.filter(c => c.linkedDoctorId === null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3 mb-6 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800">إدارة ربط الأطفال بـ {doctor.name}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><XIcon className="w-6 h-6 text-slate-500"/></button>
        </div>
        <div className="overflow-y-auto space-y-6">
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">الأطفال المربوطون حالياً ({linkedChildren.length})</h4>
            <div className="space-y-2">
              {linkedChildren.length > 0 ? linkedChildren.map(child => (
                <div key={child.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <p>{child.name}</p>
                  <button onClick={() => onUnlink(child.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition">إلغاء الربط</button>
                </div>
              )) : <p className="text-sm text-slate-500">لا يوجد أطفال مربوطون.</p>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">الأطفال غير المربوطين ({unlinkedChildren.length})</h4>
            <div className="space-y-2">
              {unlinkedChildren.length > 0 ? unlinkedChildren.map(child => (
                <div key={child.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <p>{child.name}</p>
                  <button onClick={() => onLink(child.id, doctor.id)} className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition">ربط</button>
                </div>
              )) : <p className="text-sm text-slate-500">جميع الأطفال مربوطون بأطباء.</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-6 border-t mt-6 flex-shrink-0">
          <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-semibold hover:bg-slate-200">إغلاق</button>
        </div>
      </div>
    </div>
  );
};


const FormInput: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean}> = 
  ({ label, name, value, onChange, required=false }) => (
      <div>
          <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
          <input type="text" id={name} name={name} value={value} onChange={onChange} required={required} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-400 focus:outline-none transition" />
      </div>
  );

export const ManageDoctors: React.FC<ManageDoctorsProps> = ({ doctorProfiles, childProfiles, onAdd, onUpdate, onDelete, onLink, onUnlink }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | Omit<DoctorProfile, 'id' | 'linkCode'>>(EMPTY_DOCTOR);
  const [showLinksModal, setShowLinksModal] = useState<DoctorProfile | null>(null);

  const handleAddNew = () => {
    setEditingDoctor(EMPTY_DOCTOR);
    setShowForm(true);
  };
  
  const handleEdit = (doctor: DoctorProfile) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleDelete = (doctor: DoctorProfile) => {
    if (window.confirm(`هل أنت متأكد من حذف الطبيب "${doctor.name}"؟ سيتم أيضًا إلغاء ربطه بجميع الأطفال.`)) {
        onDelete(doctor.id);
    }
  };
  
  const handleSave = (doctor: DoctorProfile | Omit<DoctorProfile, 'id' | 'linkCode'>) => {
    if ('id' in doctor) {
        onUpdate(doctor);
    } else {
        onAdd(doctor as Omit<DoctorProfile, 'id' | 'linkCode'>);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <StethoscopeIcon className="w-10 h-10 text-teal-500" />
          <h1 className="text-3xl font-bold text-slate-800">إدارة الأطباء</h1>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span>إضافة طبيب جديد</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">قائمة الأطباء ({doctorProfiles.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="p-3 font-semibold">الاسم</th>
                <th className="p-3 font-semibold">التخصص</th>
                <th className="p-3 font-semibold">كود الربط</th>
                <th className="p-3 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {doctorProfiles.map(doc => (
                <tr key={doc.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3 font-semibold">{doc.name}</td>
                  <td className="p-3">{doc.specialty}</td>
                  <td className="p-3 font-mono text-sm">{doc.linkCode}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                        <button onClick={() => setShowLinksModal(doc)} className="text-teal-600 hover:text-teal-800 p-1" aria-label={`إدارة ربط ${doc.name}`}><LinkIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleEdit(doc)} className="text-sky-600 hover:text-sky-800 p-1" aria-label={`تعديل ${doc.name}`}><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(doc)} className="text-red-600 hover:text-red-800 p-1" aria-label={`حذف ${doc.name}`}><TrashIcon className="w-5 h-5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showForm && <DoctorForm doctor={editingDoctor} onSave={handleSave} onCancel={() => setShowForm(false)} />}
      {showLinksModal && <ManageLinksModal doctor={showLinksModal} childProfiles={childProfiles} onLink={onLink} onUnlink={onUnlink} onClose={() => setShowLinksModal(null)} />}
    </div>
  );
};