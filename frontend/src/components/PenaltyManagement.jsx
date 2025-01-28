import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPenalty, fetchPenalties, deletePenalty } from '../store/penaltiesSlice';
import { fetchProfiles } from '../store/profilesSlice';
import { addNotification } from '../store/notificationSlice';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function PenaltyManagement() {
    const dispatch = useDispatch();
    const penalties = useSelector((state) => state.penalties.items);
    const profiles = useSelector((state) => state.profiles.items);
    const [formData, setFormData] = useState({
        name: '',
        points: 0,
        profile_id: ''
    });

    useEffect(() => {
        dispatch(fetchPenalties());
        dispatch(fetchProfiles());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createPenalty({
                ...formData,
                points: Number(formData.points),
                profile_id: Number(formData.profile_id)
            })).unwrap();
            
            dispatch(addNotification({
                type: 'success',
                message: 'Ceza başarıyla eklendi'
            }));

            setFormData({
                name: '',
                points: 0,
                profile_id: ''
            });

            // Profilleri güncelle
            dispatch(fetchProfiles());
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to add penalty'
            }));
        }
    };

    const handleDeletePenalty = async (penaltyId) => {
        if (window.confirm('Are you sure you want to delete this penalty? The points will be restored to the profile.')) {
            try {
                await dispatch(deletePenalty(penaltyId)).unwrap();
                
                dispatch(addNotification({
                    type: 'success',
                    message: 'Ceza başarıyla silindi'
                }));
                
                // Profilleri güncelle
                dispatch(fetchProfiles());
            } catch (error) {
                dispatch(addNotification({
                    type: 'error',
                    title: 'Error',
                    message: error.message || 'Failed to delete penalty'
                }));
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6">Yeni Ceza Ekle</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ceza Adı</label>
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
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kişi</label>
                        <select
                            value={formData.profile_id}
                            onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
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

                    <button
                        type="submit"
                        className="w-full bg-primary text-white rounded-md py-2 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Ceza Ekle
                    </button>
                </form>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6">Ceza Geçmişi</h2>
                <div className="space-y-4">
                    {penalties.map((penalty) => (
                        <div
                            key={penalty.id}
                            className="flex justify-between items-center p-4 border rounded-lg"
                        >
                            <div>
                                <h3 className="font-medium">{penalty.name}</h3>
                                <p className="text-sm text-gray-500">
                                    Kişiye atandı: {penalty.profile_name}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-red-600 font-medium">-{penalty.points} puan</p>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(penalty.created_at), 'MMM d, yyyy', {locale: tr})}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeletePenalty(penalty.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <span className="sr-only">Sil</span>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 