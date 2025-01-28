import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProfile, fetchProfiles } from '../store/profilesSlice';
import { fetchPenalties } from '../store/penaltiesSlice';
import { fetchRewards } from '../store/rewardsSlice';
import ProfileDetail from './ProfileDetail';
import { addNotification } from '../store/notificationSlice';
import * as HeroIcons from '@heroicons/react/24/outline';

const roles = ['mother', 'father', 'daughter', 'son'];
const colors = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F59E0B' },
];

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
  //'RocketIcon'
];

export default function ProfileManagement() {
  const dispatch = useDispatch();
  const profiles = useSelector((state) => state.profiles.items);
  const penalties = useSelector((state) => state.penalties.items);
  const rewards = useSelector((state) => state.rewards.items);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'mother',
    color_theme: '#3B82F6',
    icon_name: 'UserCircleIcon'
  });
  const [showIconPicker, setShowIconPicker] = useState(false);

  const profilesStatus = useSelector((state) => state.profiles.status);

  useEffect(() => {
    dispatch(fetchProfiles());
    dispatch(fetchPenalties());
    dispatch(fetchRewards());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createProfile(formData)).unwrap();
      setFormData({
        name: '',
        role: 'mother',
        color_theme: '#3B82F6',
        icon_name: 'UserCircleIcon'
      });
      dispatch(addNotification({
        type: 'success',
        message: 'Kişi başarıyla oluştu'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create profile'
      }));
    }
  };

  const IconComponent = HeroIcons[formData.icon_name];

  const renderContent = () => {
    if (profilesStatus === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-6">Yeni Kişi Ekle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                İsim
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Renk Teması
              </label>
              <input
                    type="color"
                    value={formData.color_theme}
                    onChange={(e) => setFormData({ ...formData, color_theme: e.target.value })}
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
              {/*<div className="mt-2 grid grid-cols-5 gap-4">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      formData.color_theme === color.value
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData({ ...formData, color_theme: color.value })}
                  />
                ))}
              </div>*/}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Icon</label>
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="mt-1 flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50"
              >
                <IconComponent className="h-6 w-6" style={{ color: formData.color_theme }} />
                <span>{formData.icon_name}</span>
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
                          setFormData({ ...formData, icon_name: iconName });
                          setShowIconPicker(false);
                        }}
                        className={`p-2 rounded-md hover:bg-gray-100 ${
                          formData.icon_name === iconName ? 'bg-gray-100' : ''
                        }`}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{ color: formData.color_theme }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white rounded-md py-2 px-4 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Kişi Oluştur
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-6">Mevcut Kişiler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const IconComponent = HeroIcons[profile.icon_name || 'UserCircleIcon'];
              return (
                <div
                  key={profile.id}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: profile.color_theme, borderLeftWidth: '4px' }}
                  onClick={() => setSelectedProfile(profile)}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-6 w-6" style={{ color: profile.color_theme }} />
                    <div>
                      <h3 className="font-medium">{profile.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
                      <p className="text-sm text-gray-500 mt-2">Puan: {profile.points}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedProfile && (
          <ProfileDetail
            profile={selectedProfile}
            penalties={penalties}
            rewards={rewards}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </div>
    );
  };

  return renderContent();
} 