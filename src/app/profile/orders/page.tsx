'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserOrders } from '@/lib/payments/orderApi';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

type Order = Database['public']['Tables']['orders']['Row'];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userOrders = await getUserOrders();
        setOrders(userOrders);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order history.';
        setError(errorMessage);
        console.error(err);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null || currency === null) return 'N/A';
    // Assuming amount is in cents
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount / 100);
  };

  const getStatusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending_payment':
      case 'processing': return 'secondary';
      case 'payment_failed': 
      case 'canceled': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading order history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading orders:</p>
        <p className="text-sm">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            {/* Optional: Add a link to start creating a portrait or browse */}
            <div className="text-center mt-4">
              <Link href="/pets/new" passHref>
                <Button>Create Your First Portrait</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>A list of your past orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium truncate max-w-[100px]" title={order.id}>#{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{order.created_at ? format(new Date(order.created_at), 'PPP') : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>{(order.status || 'unknown').replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total_amount, order.currency)}</TableCell>
                     <TableCell>
                       <Link href={`/profile/orders/${order.id}`} passHref>
                          <Button variant="outline" size="sm">View Details</Button>
                       </Link>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {/* Optional: Add pagination if many orders */}
        </Card>
      )}
    </div>
  );
} 