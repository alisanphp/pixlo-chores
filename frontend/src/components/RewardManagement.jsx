import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReward, fetchRewards, assignReward } from '../store/rewardsSlice';
import { fetchProfiles } from '../store/profilesSlice';
import { addNotification } from '../store/notificationSlice';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function RewardManagement() {
  // All hooks must be called before any conditional returns
  const dispatch = useDispatch();
  const rewards = useSelector((state) => state.rewards.items);
  const profiles = useSelector((state) => state.profiles.items);
  const rewardsStatus = useSelector((state) => state.rewards.status);
  const profilesStatus = useSelector((state) => state.profiles.status);

  const [formData, setFormData] = useState({
    name: '',
    points_cost: 0
  });

  const [assignmentData, setAssignmentData] = useState({
    rewardId: '',
    profileId: ''
  });

  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    dispatch(fetchRewards());
    dispatch(fetchProfiles());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createReward({
        ...formData,
        points_cost: Number(formData.points_cost)
      })).unwrap();
      setFormData({ name: '', points_cost: 0 });
    } catch (error) {
      console.error('Failed to create reward:', error);
    }
  };

  const handleAssignReward = async (rewardId, profileId) => {
    try {
      await dispatch(assignReward({
        rewardId,
        profileId,
        date: format(new Date(), 'yyyy-MM-dd', {locale: tr})
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: 'Ödül atandı!'
      }));

      dispatch(fetchProfiles());
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to assign reward'
      }));
    }
  };

  const renderContent = () => {
    if (rewardsStatus === 'loading' || profilesStatus === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-6">Yeni Ödül Ekle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ödül</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Puan Değeri</label>
              <input
                type="number"
                min="0"
                value={formData.points_cost}
                onChange={(e) => setFormData({ ...formData, points_cost: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white rounded-md py-2 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Ödül Oluştur
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Uygun Ödüller</h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-primary text-white rounded-md px-4 py-2 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Ödül Ata
            </button>
          </div>

          <div className="space-y-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{reward.name}</h3>
                  <span className="text-sm text-gray-500">{reward.points_cost} puan</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAssignModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-medium mb-4">Ödül Ata</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAssignReward(assignmentData.rewardId, assignmentData.profileId);
                setShowAssignModal(false);
                setAssignmentData({ rewardId: '', profileId: '' });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ödül</label>
                  <select
                    value={assignmentData.rewardId}
                    onChange={(e) => setAssignmentData({ ...assignmentData, rewardId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  >
                    <option value="">Bir ödül seç</option>
                    {rewards.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.name} ({reward.points_cost} puan)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kişi</label>
                  <select
                    value={assignmentData.profileId}
                    onChange={(e) => setAssignmentData({ ...assignmentData, profileId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  >
                    <option value="">Bir kişi seç</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} ({profile.points} puan)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="bg-gray-200 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white rounded-md px-4 py-2 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Ata
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  return renderContent();
} 