import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MapPin, Star, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = useState(0);

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      const res = await api.get(`/stores/${id}`);
      return res.data.data;
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (rating) => {
      // If userRating exists, we use PATCH, else POST
      if (store.userRating) {
        return api.patch(`/stores/${id}/ratings`, { rating });
      }
      return api.post(`/stores/${id}/ratings`, { rating });
    },
    onSuccess: () => {
      toast.success('Rating submitted successfully!');
      queryClient.invalidateQueries(['store', id]);
    },
    onError: (err) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Failed to submit rating'));
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading store details...</div>;
  if (!store) return <div className="p-8 text-center text-red-500">Store not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/stores')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stores
      </Button>

      <Card className="overflow-hidden">
        <div className="h-32 bg-primary/10"></div>
        <CardHeader className="relative pb-0 pt-6">
          <CardTitle className="text-3xl font-bold">{store.name}</CardTitle>
          <div className="flex items-center text-gray-500 mt-2 space-x-2">
            <MapPin className="h-5 w-5 shrink-0" />
            <span>{store.address}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email Contact</h3>
              <p>{store.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Community Rating</h3>
              <div className="flex items-center space-x-2">
                <Star className={`h-6 w-6 ${store.averageRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                <span className="font-bold text-2xl">
                  {store.averageRating ? store.averageRating.toFixed(1) : 'NR'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border flex flex-col items-center justify-center space-y-4">
            <h3 className="font-semibold text-center">
              {store.userRating ? 'Update your rating' : 'Rate this store'}
            </h3>
            
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const currentRating = hoverRating || store.userRating || 0;
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={ratingMutation.isPending}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => ratingMutation.mutate(star)}
                    className="p-1 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Star 
                      className={`h-10 w-10 transition-colors ${
                        star <= currentRating 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-500">
              {store.userRating ? `You rated this ${store.userRating} stars` : 'Click to rate'}
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default StoreDetail;
