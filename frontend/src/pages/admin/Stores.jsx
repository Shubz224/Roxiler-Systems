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

const storeSchema = z.object({
  name: z.string()
    .min(1, 'Store name is required')
    .max(60, 'Store name cannot exceed 60 characters'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string()
    .min(1, 'Address is required')
    .max(400, 'Address cannot exceed 400 characters'),
  ownerId: z.coerce.number().int().min(1, 'Please select a Store Owner'),
});

const AdminStores = () => {
  const queryClient = useQueryClient();
  
  // Filters
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });

  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch only STORE_OWNERs for the dropdown
  const { data: owners } = useQuery({
    queryKey: ['admin-users', { role: 'STORE_OWNER' }],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params: { role: 'STORE_OWNER' } });
      return res.data.data;
    },
  });

  // Fetch stores
  const { data: stores, isLoading } = useQuery({
    queryKey: ['admin-stores', filters, sortBy, sortOrder],
    queryFn: async () => {
      const res = await api.get('/admin/stores', { params: { ...filters, sortBy, sortOrder } });
      return res.data.data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(storeSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/admin/stores', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Store created successfully');
      reset();
      queryClient.invalidateQueries(['admin-stores']);
    },
    onError: (err) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Error creating store'));
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
      <h1 className="text-2xl font-bold">Manage Stores</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Store</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input placeholder="Store Name" {...register('name')} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Input type="email" placeholder="Store Email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Input placeholder="Address" {...register('address')} />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div className="flex space-x-4 items-center">
              <select 
                {...register('ownerId')} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select an Owner...</option>
                {owners?.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                ))}
              </select>
              <Button type="submit" disabled={mutation.isPending || !owners?.length}>
                {mutation.isPending ? 'Creating...' : 'Create Store'}
              </Button>
            </div>
            {errors.ownerId && <p className="text-red-500 text-xs mt-1 col-span-2">{errors.ownerId.message}</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Stores</CardTitle>
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
            <Input 
              placeholder="Search by address..." 
              value={filters.address}
              onChange={(e) => setFilters({ ...filters, address: e.target.value })}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading stores...</div>
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
                  <TableHead>Address</TableHead>
                  <TableHead>Avg Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores?.map(store => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.email}</TableCell>
                    <TableCell className="truncate max-w-xs">{store.address}</TableCell>
                    <TableCell>
                      {store.averageRating ? (
                        <span className="flex items-center text-yellow-600 font-bold">
                          ★ {store.averageRating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {stores?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">No stores found.</TableCell>
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

export default AdminStores;
