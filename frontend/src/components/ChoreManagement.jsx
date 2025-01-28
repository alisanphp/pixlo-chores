import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createChore, deleteChore, fetchChores } from '../store/choresSlice';
import { fetchProfiles } from '../store/profilesSlice';
import { addNotification } from '../store/notificationSlice';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const DAYS_OF_WEEK = [
  { id: 'MON', label: 'Monday' },
  { id: 'TUE', label: 'Tuesday' },
  { id: 'WED', label: 'Wednesday' },
  { id: 'THU', label: 'Thursday' },
  { id: 'FRI', label: 'Friday' },
  { id: 'SAT', label: 'Saturday' },
  { id: 'SUN', label: 'Sunday' }
];

export default function ChoreManagement() {
  const dispatch = useDispatch();
  const profiles = useSelector((state) => state.profiles.items);
  const chores = useSelector((state) => state.chores.items);
  const [formData, setFormData] = useState({
    title: '',
    points: 0,
    is_repeat: false,
    repeat_start_date: format(new Date(), 'yyyy-MM-dd', {locale: tr}),
    repeat_interval: 'daily',
    repeat_all_day: true,
    repeat_time: '',
    repeat_days: [],
    repeat_until: '',
    profile_ids: []
  });

  const [filterProfileId, setFilterProfileId] = useState('all');

  useEffect(() => {
    dispatch(fetchProfiles());
    dispatch(fetchChores());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      repeat_days: formData.repeat_interval === 'weekly' ? formData.repeat_days : null,
      repeat_time: formData.repeat_all_day ? null : formData.repeat_time,
      profile_ids: formData.profile_ids.map(id => Number(id))
    };
    try {
      await dispatch(createChore(data)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'İş başarıyla oluşturuldu'
      }));
      setFormData({
        title: '',
        points: 0,
        is_repeat: false,
        repeat_start_date: format(new Date(), 'yyyy-MM-dd', {locale: tr}),
        repeat_interval: 'daily',
        repeat_all_day: true,
        repeat_time: '',
        repeat_days: [],
        repeat_until: '',
        profile_ids: []
      });
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create chore'
      }));
    }
  };

  const handleDeleteChore = async (choreId) => {
    if (window.confirm('Are you sure you want to delete this chore?')) {
      try {
        await dispatch(deleteChore(choreId)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'İş başarıyla silindi'
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to delete chore'
        }));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-6">Yeni İş Ekle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">İş</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Puan</label>
              <input
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
              <input
                type="date"
                value={formData.repeat_start_date}
                onChange={(e) => setFormData({ ...formData, repeat_start_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tekrarla</label>
              <input
                type="checkbox"
                checked={formData.is_repeat}
                onChange={(e) => setFormData({ ...formData, is_repeat: e.target.checked })}
              />
            </div>

            {formData.is_repeat && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tekrar Tipi</label>
                  <select
                    value={formData.repeat_interval}
                    onChange={(e) => setFormData({ ...formData, repeat_interval: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="daily">Günlük</option>
                    <option value="weekly">Haftalık</option>
                    <option value="monthly">Aylık</option>
                  </select>
                </div>

                {formData.repeat_interval === 'daily' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tüm gün</label>
                    <input
                      type="checkbox"
                      checked={formData.repeat_all_day}
                      onChange={(e) => setFormData({ ...formData, repeat_all_day: e.target.checked })}
                    />
                  </div>
                )}

                {formData.repeat_interval === 'weekly' && (
                  <div>
                    {DAYS_OF_WEEK.map(day => (
                      <label key={day.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.repeat_days.includes(day.id)}
                          onChange={(e) => {
                            const days = e.target.checked
                              ? [...formData.repeat_days, day.id]
                              : formData.repeat_days.filter(d => d !== day.id);
                            setFormData({ ...formData, repeat_days: days });
                          }}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="ml-3">{day.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarihe Kadar</label>
                  <input
                    type="date"
                    value={formData.repeat_until}
                    onChange={(e) => setFormData({ ...formData, repeat_until: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Kişilere Ata</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <label
                  key={profile.id}
                  className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={formData.profile_ids.includes(profile.id)}
                    onChange={(e) => {
                      const ids = e.target.checked
                        ? [...formData.profile_ids, profile.id]
                        : formData.profile_ids.filter(id => id !== profile.id);
                      setFormData({ ...formData, profile_ids: ids });
                    }}
                  />
                  <span className="ml-3 flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{profile.name}</span>
                    <span className="text-sm text-gray-500">{profile.role}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white rounded-md py-2 px-4 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            İş Oluştur
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Tüm İşler</h2>
          <select
            value={filterProfileId}
            onChange={(e) => setFilterProfileId(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="all">Tüm Kişiler</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-4">
          {chores
            .filter(chore => {
              if (filterProfileId === 'all') return true;
              return chore.profiles?.some(p => p.id === Number(filterProfileId));
            })
            .map((chore) => (
              <div
                key={chore.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{chore.title}</h3>
                  <p className="text-sm text-gray-500">
                    {chore.points} puan | {chore.is_repeat ? 'Tekrarlı' : 'Bir Kere'} |
                    Başlama: {format(new Date(chore.repeat_start_date), 'MMM d, yyyy', {locale: tr})}
                  </p>
                  <p className="text-sm text-gray-500">
                    Kişiye atandı: {chore.profiles?.map(p => p.name).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteChore(chore.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <span className="sr-only">Sil</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 