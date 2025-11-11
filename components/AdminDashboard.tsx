
import React from 'react';
import { ChildProfile, DoctorProfile, FoodItem, ParentProfile } from '../types';
import { AdminView } from '../App';
import { ShieldIcon, UsersIcon, StethoscopeIcon, ChefHatIcon, ChildIcon, EditIcon, TrashIcon, ToggleLeftIcon, ToggleRightIcon, LinkIcon } from './Icons';
import { ManageFoodItems } from './ManageFoodItems';
import { calculateAge } from '../constants';
import { ManageDoctors } from './ManageDoctors';

interface AdminDashboardProps {
  adminView: AdminView;
  setAdminView: (view: AdminView) => void;
  onSwitchToParentView: () => void;
  foodItems: FoodItem[];
  onAddFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  onUpdateFoodItem: (item: FoodItem) => void;
  onDeleteFoodItem: (id: string) => void;
  childProfiles: ChildProfile[];
  doctorProfiles: DoctorProfile[];
  parentProfile: ParentProfile;
  onToggleChildStatus: (childId: number) => void;
  onAddDoctor: (data: Omit<DoctorProfile, 'id' | 'linkCode'>) => void;
  onUpdateDoctor: (data: DoctorProfile) => void;
  onDeleteDoctor: (id: number) => void;
  onAdminLinkDoctor: (childId: number, doctorId: number) => void;
  onAdminUnlinkDoctor: (childId: number) => void;
}

interface ManageChildrenProps {
    childProfiles: ChildProfile[];
    parentProfile: ParentProfile;
    doctorProfiles: DoctorProfile[];
    onToggleStatus: (childId: number) => void;
}

const ManageChildren: React.FC<ManageChildrenProps> = ({ childProfiles, parentProfile, doctorProfiles, onToggleStatus }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">إدارة الأطفال ({childProfiles.length})</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="border-b text-slate-500">
                    <tr>
                        <th className="p-3 font-semibold">اسم الطفل</th>
                        <th className="p-3 font-semibold">العمر</th>
                        <th className="p-3 font-semibold">ولي الأمر</th>
                        <th className="p-3 font-semibold">الطبيب المربوط</th>
                        <th className="p-3 font-semibold">الحالة</th>
                        <th className="p-3 font-semibold">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {childProfiles.map(child => {
                        const parent = child.parentId === parentProfile.id ? parentProfile : null;
                        const doctor = doctorProfiles.find(d => d.id === child.linkedDoctorId);
                        return (
                            <tr key={child.id} className={`border-b last:border-0 hover:bg-slate-50 ${!child.isActive ? 'opacity-50 bg-slate-100' : ''}`}>
                                <td className="p-3 font-semibold">{child.name}</td>
                                <td className="p-3">{calculateAge(child.dateOfBirth)} سنة</td>
                                <td className="p-3">{parent?.name || 'غير محدد'}</td>
                                <td className="p-3">{doctor?.name || 'لا يوجد'}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${child.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {child.isActive ? 'فعال' : 'غير فعال'}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <div className="flex gap-2 items-center">
                                        <button onClick={() => onToggleStatus(child.id)} className={`p-1 ${child.isActive ? 'text-green-600' : 'text-slate-400'}`} aria-label={child.isActive ? `تعطيل ${child.name}` : `تفعيل ${child.name}`}>
                                            {child.isActive ? <ToggleRightIcon className="w-6 h-6"/> : <ToggleLeftIcon className="w-6 h-6"/>}
                                        </button>
                                        <button className="text-sky-600 hover:text-sky-800 p-1" aria-label={`تعديل ${child.name}`}><EditIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
);


export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const { adminView, setAdminView, onSwitchToParentView, foodItems, onAddFoodItem, onUpdateFoodItem, onDeleteFoodItem, childProfiles, doctorProfiles, parentProfile, onToggleChildStatus, onAddDoctor, onUpdateDoctor, onDeleteDoctor, onAdminLinkDoctor, onAdminUnlinkDoctor } = props;

  const navItems = [
    { id: 'children', label: 'إدارة الأطفال', icon: <ChildIcon className="w-6 h-6" />, view: 'children' as AdminView },
    { id: 'doctors', label: 'إدارة الأطباء', icon: <StethoscopeIcon className="w-6 h-6" />, view: 'doctors' as AdminView },
    { id: 'food', label: 'إدارة الأصناف', icon: <ChefHatIcon className="w-6 h-6" />, view: 'food' as AdminView },
  ];

  const renderAdminView = () => {
    switch (adminView) {
      case 'children':
        return <ManageChildren childProfiles={childProfiles} parentProfile={parentProfile} doctorProfiles={doctorProfiles} onToggleStatus={onToggleChildStatus} />;
      case 'doctors':
        return <ManageDoctors 
                  doctorProfiles={doctorProfiles}
                  childProfiles={childProfiles}
                  onAdd={onAddDoctor}
                  onUpdate={onUpdateDoctor}
                  onDelete={onDeleteDoctor}
                  onLink={onAdminLinkDoctor}
                  onUnlink={onAdminUnlinkDoctor}
               />;
      case 'food':
        return <ManageFoodItems 
                foodItems={foodItems}
                onAdd={onAddFoodItem}
                onUpdate={onUpdateFoodItem}
                onDelete={onDeleteFoodItem}
               />;
      case 'dashboard':
      default:
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-bold mb-4">لوحة تحكم المسؤول</h2>
                <p className="text-slate-600">
                    مرحباً بك في لوحة التحكم. من هنا يمكنك إدارة جميع جوانب المنصة. الرجاء اختيار قسم من القائمة الجانبية للبدء.
                </p>
            </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <aside className="w-20 lg:w-64 bg-slate-800 text-white shadow-md flex flex-col transition-all duration-300">
        <div className="p-4 border-b border-slate-700 h-20 flex flex-col justify-center">
          <div className="flex items-center justify-center lg:justify-start">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <ShieldIcon className="w-6 h-6 text-white" />
            </div>
            <div className="hidden lg:block ml-3">
              <h1 className="font-bold text-lg leading-tight">لوحة التحكم</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 lg:px-4 py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setAdminView(item.view)}
                  className={`flex items-center w-full p-3 my-2 rounded-lg transition-colors duration-200 ${
                    adminView === item.view
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="hidden lg:block mr-4">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-2 lg:px-4 py-4 border-t border-slate-700">
          <button
            onClick={onSwitchToParentView}
            className="flex items-center w-full p-3 my-2 rounded-lg transition-colors duration-200 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <UsersIcon className="w-6 h-6" />
            <span className="hidden lg:block mr-4">واجهة ولي الأمر</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {renderAdminView()}
      </main>
    </div>
  );
};