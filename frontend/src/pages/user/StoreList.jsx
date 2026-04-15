import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Store, MapPin, Star, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const StoreList = () => {
  const [search, setSearch] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 9; // Display 3x3 grid
  
  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const { data, isLoading } = useQuery({
    queryKey: ['stores', { search, addressSearch, page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      const res = await api.get('/stores', {
        params: { name: search, address: addressSearch, page, limit, sortBy, sortOrder }
      });
      return res.data.data;
    },
    keepPreviousData: true
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
    if (sortBy !== field) return <ArrowUpDown className="ml-1 h-3 w-3" />;
    return sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Registered Stores</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name..." 
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="relative w-full sm:w-64">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Filter by address..." 
              className="pl-9"
              value={addressSearch}
              onChange={(e) => { setAddressSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="inline-flex items-center space-x-2 text-sm bg-white p-1.5 rounded-lg border w-fit">
        <span className="px-2 text-gray-500 font-medium">Sort by:</span>
        <Button variant={sortBy === 'name' ? 'default' : 'ghost'} size="sm" onClick={() => toggleSort('name')}>
          Name <SortIcon field="name" />
        </Button>
        <Button variant={sortBy === 'email' ? 'default' : 'ghost'} size="sm" onClick={() => toggleSort('email')}>
          Email <SortIcon field="email" />
        </Button>
      </div>

      {isLoading && <div className="text-center py-10">Loading stores...</div>}

      {!isLoading && data?.stores?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No stores found</h3>
          <p className="text-gray-500">Try adjusting your search filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.stores?.map(store => (
              <Card key={store.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate" title={store.name}>{store.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-start space-x-2 text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="line-clamp-2" title={store.address}>{store.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className={`h-5 w-5 ${store.averageRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    <span className="font-semibold text-gray-900">
                      {store.averageRating ? store.averageRating.toFixed(1) : 'No ratings yet'}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/stores/${store.id}`}>View Details & Rate</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {data?.total > limit && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">Page {page} of {Math.ceil(data.total / limit)}</span>
              <Button 
                variant="outline" 
                disabled={page >= Math.ceil(data.total / limit)}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoreList;
