import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Tab } from '@headlessui/react';
import { updateProfile } from '../store/profilesSlice';
import { addNotification } from '../store/notificationSlice';
import * as HeroIcons from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const roles = ['mother', 'father', 'daughter', 'son'];

const availableIcons = [
  'UserCircleIcon',
  'UserIcon',
  'HeartIcon',
  'StarIcon',
  'HomeIcon',
  'SparklesIcon',
  'SunIcon',
  'MoonIcon',
  'CloudIcon',
  'BoltIcon',
  'FireIcon',
  // 'RocketIcon'
];

export default function ProfileDetail({ profile, onClose, penalties, rewards }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name,
    role: profile.role,
    color_theme: profile.color_theme,
    icon_name: profile.icon_name || 'UserCircleIcon'
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const IconComponent = HeroIcons[editForm.icon_name];
  const dispatch = useDispatch();

  useEffect(() => {
    setEditForm({
      name: profile.name,
      role: profile.role,
      color_theme: profile.color_theme,
      icon_name: profile.icon_name || 'UserCircleIcon'
    });
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile({
        id: profile.id,
        profileData: editForm
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Kişi başarıyla güncellendi'
      }));
      
      setIsEditing(false);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update profile'
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            {!isEditing ? (
              <div>
                <h2 className="text-2xl font-bold" style={{ color: profile.color_theme }}>
                  {profile.name}
                </h2>
                <p className="text-gray-600 capitalize">{profile.role}</p>
                <p className="text-lg font-medium mt-2">{profile.points} puan</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-sm text-primary hover:text-primary-dark"
                >
                  Kişi Düzenle
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700">İsim</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Renk Teması</label>
                  <input
                    type="color"
                    value={editForm.color_theme}
                    onChange={(e) => setEditForm({ ...editForm, color_theme: e.target.value })}
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Icon</label>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="mt-1 flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50"
                  >
                    <IconComponent className="h-6 w-6" style={{ color: editForm.color_theme }} />
                    <span>{editForm.icon_name}</span>
                  </button>

                  {showIconPicker && (
                    <div className="absolute z-10 mt-2 p-2 bg-white border rounded-lg shadow-lg grid grid-cols-6 gap-2">
                      {availableIcons.map((iconName) => {
                        const Icon = HeroIcons[iconName];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => {
                              setEditForm({ ...editForm, icon_name: iconName });
                              setShowIconPicker(false);
                            }}
                            className={`p-2 rounded-md hover:bg-gray-100 ${
                              editForm.icon_name === iconName ? 'bg-gray-100' : ''
                            }`}
                          >
                            <Icon
                              className="h-6 w-6"
                              style={{ color: editForm.color_theme }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-primary text-white rounded-md px-4 py-2 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Tab.Group onChange={setSelectedTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              {['İşler', 'Cezalar', 'Ödüller'].map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white shadow text-primary'
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary'
                    )
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <div className="space-y-4">
                  {profile.chores?.map((chore) => (
                    <div
                      key={chore.id}
                      className="p-4 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium">{chore.title}</h3>
                        <p className="text-sm text-gray-500">
                          {chore.is_completed ? 'Tamamlandı' : 'Yapılmadı'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">+{chore.points} puan</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-4">
                  {penalties?.filter(p => p.profile_id === profile.id).map((penalty) => (
                    <div
                      key={penalty.id}
                      className="p-4 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium">{penalty.name}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(penalty.created_at), 'MMM d, yyyy', {locale: tr})}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">-{penalty.points} puan</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-4">
                  {rewards?.reduce((acc, reward) => {
                    // Profil için olan tüm atamaları bul
                    const profileAssignments = reward.assignments?.filter(a => 
                      a.profile_id === profile.id
                    ) || [];
                    
                    // Her atama için bir kart oluştur
                    const assignmentCards = profileAssignments.map(assignment => ({
                      ...reward,
                      assignmentDate: assignment.assigned_at,
                      assignmentId: `${reward.id}-${assignment.assigned_at}`
                    }));
                    
                    return [...acc, ...assignmentCards];
                  }, [])
                  // Tarihe göre sırala (en yeni en üstte)
                  .sort((a, b) => new Date(b.assignmentDate) - new Date(a.assignmentDate))
                  .map((rewardWithAssignment) => (
                    <div
                      key={rewardWithAssignment.assignmentId}
                      className="p-4 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium">{rewardWithAssignment.name}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(rewardWithAssignment.assignmentDate), 'MMM d, yyyy', {locale: tr})}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">-{rewardWithAssignment.points_cost} puan</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
} 