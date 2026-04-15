import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';

const userSchema = z.object({
  name: z.string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name cannot exceed 60 characters'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string()
    .min(1, 'Address is required')
    .max(400, 'Address cannot exceed 400 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password cannot exceed 16 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[!@#$%^&*]/, 'Password must include a special character (!@#$%^&*)'),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'], { required_error: 'Role is required' }),
});

const AdminUsers = () => {
  const queryClient = useQueryClient();
  
  // Filters
  const [filters, setFilters] = useState({ name: '', email: '', role: '' });
  
  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', filters, sortBy, sortOrder],
    queryFn: async () => {
      const res = await api.get(`/admin/users`, { 
        params: { ...filters, sortBy, sortOrder } 
      });
      return res.data.data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'USER' }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/admin/users', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User created successfully');
      reset();
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (err) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Error creating user'));
    }
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input placeholder="Full Name (min 20 chars)" {...register('name')} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Input type="email" placeholder="Email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Input placeholder="Address" {...register('address')} />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <Input type="password" placeholder="Password" {...register('password')} />
              <p className="text-xs text-gray-500 mt-1">8-16 chars, 1 uppercase, 1 special</p>
              {errors.password && <p className="text-red-500 text-xs mt-1">Invalid password format</p>}
            </div>
            <div className="md:col-span-2 flex space-x-4 items-center">
              <select 
                {...register('role')} 
                className="flex h-10 w-full md:max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Input 
              placeholder="Search by name..." 
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
            <Input 
              placeholder="Search by email..." 
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            />
            <select 
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Roles</option>
              <option value="USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => toggleSort('name')}>
                    <div className="flex items-center">Name <SortIcon field="name" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => toggleSort('email')}>
                    <div className="flex items-center">Email <SortIcon field="email" /></div>
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 
                        user.role === 'STORE_OWNER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="truncate max-w-xs" title={user.address}>{user.address}</TableCell>
                  </TableRow>
                ))}
                {users?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
