import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 chars')
    .max(16, 'Password max 16 chars')
    .regex(/[A-Z]/, 'Must include uppercase letter')
    .regex(/[!@#$%^&*]/, 'Must include special character'),
});

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.patch('/auth/change-password', data);
      toast.success('Password updated successfully');
      reset(); // clear form
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Failed to update'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" placeholder="••••••••" {...register('currentPassword')} />
              {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input type="password" placeholder="••••••••" {...register('newPassword')} />
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
              <p className="text-xs text-gray-500">8-16 chars, 1 uppercase, 1 special</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
