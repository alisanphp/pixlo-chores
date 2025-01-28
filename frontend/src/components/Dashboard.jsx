import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfiles } from '../store/profilesSlice';
import { fetchChores, toggleChoreCompletion } from '../store/choresSlice';
import { format, isToday, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { addNotification } from '../store/notificationSlice';
import * as HeroIcons from '@heroicons/react/24/outline';

export default function Dashboard() {
  const dispatch = useDispatch();
  const profiles = useSelector((state) => state.profiles.items);
  const profilesStatus = useSelector((state) => state.profiles.status);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('all');

  useEffect(() => {
    dispatch(fetchProfiles({ date: format(selectedDate, 'yyyy-MM-dd', {locale: tr}) }));
  }, [dispatch, selectedDate]);

  const handleToggleCompletion = async (choreId, profileId, isCompleted) => {
    try {
      await dispatch(toggleChoreCompletion({ 
        choreId, 
        profileId, 
        isCompleted,
        date: format(selectedDate, 'yyyy-MM-dd', {locale: tr})
      })).unwrap();
      await dispatch(fetchProfiles({ date: format(selectedDate, 'yyyy-MM-dd', {locale: tr}) }));
      dispatch(addNotification({
        type: 'success',
        message: `İş ${isCompleted ? 'tamamlandı' : 'tamamlanmadı'} `,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update chore status',
      }));
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  if (profilesStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('Profiles:', profiles);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 1);
                handleDateChange(newDate);
              }}
              className="p-2 rounded hover:bg-gray-100"
            >
              Önceki Gün
            </button>
            <span className="text-lg font-medium">
              {format(selectedDate, 'MMMM d, yyyy', {locale: tr})}
            </span>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 1);
                handleDateChange(newDate);
              }}
              className="p-2 rounded hover:bg-gray-100"
            >
              Sonraki Gün
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2">Tamamlananları Göster</span>
            </label>
            
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="rounded-md border-gray-300 focus:border-primary focus:ring-primary"
            >
              <option value="all">Tüm Kişiler</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {profiles
          .filter(profile => selectedProfile === 'all' || profile.id === Number(selectedProfile))
          .map((profile) => {
            // Sadece tamamlanma durumuna göre filtrele
            /*const profileChores = profile.chores.filter(chore => 
              showCompleted || !chore.is_completed
            );*/
            const profileChores = profile.chores;
            const completedCount = profileChores.filter(chore => chore.is_completed).length;
            const IconComponent = HeroIcons[profile.icon_name || 'UserCircleIcon'];
            return (
              <div
                key={profile.id}
                className="bg-white shadow rounded-lg p-6"
                style={{ borderTop: `4px solid ${profile.color_theme}` }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium"><IconComponent className="h-6 w-6 mr-1" style={{ color: profile.color_theme, float: 'left' }} /> {profile.name}</h3>
                    <span className="text-sm text-gray-500">{profile.points} puan</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {completedCount}/{profileChores.length} tamamlandı
                  </div>
                </div>

                <div className="space-y-3">
                  {profileChores.length > 0 ? (
                    profileChores.map((chore) => (
                      ((showCompleted === true && chore.is_completed === true) || (showCompleted === false)) && (
                        <div
                          key={chore.id}
                          style={{ borderLeft: `4px solid ${profile.color_theme}` }}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            chore.is_completed ? 'bg-green-50' : 'bg-white'
                          }`}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{chore.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{chore.points} puan</span>
                              {chore.due_time && (
                                <span>• Due by {chore.due_time}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleCompletion(
                              chore.id,
                              profile.id,
                              !chore.is_completed
                            )}
                            className={`ml-4 p-2 rounded-full ${
                              chore.is_completed
                                ? 'text-green-600 hover:bg-green-100'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {chore.is_completed ? (
                              <CheckCircleIcon className="h-6 w-6" />
                            ) : (
                              <XCircleIcon className="h-6 w-6" />
                            )}
                          </button>
                        </div>
                      )
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No chores assigned for today
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
} 