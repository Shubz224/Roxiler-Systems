import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Store, Star, Users } from 'lucide-react';

const OwnerDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: async () => {
      const res = await api.get('/owner/dashboard');
      return res.data.data;
    },
  });

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load dashboard. Make sure you have a store created by the admin!</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">My Store Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Store</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate" title={data.store.name}>{data.store.name}</div>
            <p className="text-xs text-muted-foreground truncate">{data.store.address}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageRating ? data.averageRating.toFixed(1) : 'No ratings'}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRatings}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Ratings</CardTitle>
          <CardDescription>A list of users who rated your store.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.raters.length === 0 ? (
            <p className="text-sm text-gray-500">No one has rated your store yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rating (1-5)</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.raters.map((rater, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{rater.user.name}</TableCell>
                    <TableCell>{rater.user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{rater.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(rater.ratedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
