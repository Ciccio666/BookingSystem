import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { ServiceAddon } from '@/lib/types';
import ServiceAddonCard from './ServiceAddonCard';
import ServiceAddonForm from './ServiceAddonForm';
import { useToast } from '@/hooks/use-toast';

const ServiceAddonList = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddon, setEditingAddon] = useState<ServiceAddon | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: addons = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/service-addons'],
    staleTime: 1000 * 60, // 1 minute
  });

  const createAddonMutation = useMutation({
    mutationFn: async (newAddon: Partial<ServiceAddon>) => {
      return apiRequest('/api/service-addons', {
        method: 'POST',
        body: JSON.stringify(newAddon),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-addons'] });
      toast({
        title: 'Success',
        description: 'Service add-on created successfully',
      });
      setShowAddDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create service add-on: ${error}`,
        variant: 'destructive',
      });
    },
  });

  const updateAddonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ServiceAddon> }) => {
      return apiRequest(`/api/service-addons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-addons'] });
      toast({
        title: 'Success',
        description: 'Service add-on updated successfully',
      });
      setEditingAddon(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update service add-on: ${error}`,
        variant: 'destructive',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return apiRequest(`/api/service-addons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-addons'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update service add-on status: ${error}`,
        variant: 'destructive',
      });
    },
  });

  const handleCreateAddon = async (data: Partial<ServiceAddon>) => {
    createAddonMutation.mutate(data);
  };

  const handleUpdateAddon = async (data: Partial<ServiceAddon>) => {
    if (editingAddon) {
      updateAddonMutation.mutate({ id: editingAddon.id, data });
    }
  };

  const handleToggleActive = (addon: ServiceAddon) => {
    toggleActiveMutation.mutate({
      id: addon.id,
      active: !addon.active,
    });
  };

  if (isLoading) return <div className="py-8 text-center">Loading add-ons...</div>;

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load service add-ons.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Service Add-ons</h3>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>

      {addons.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No service add-ons found. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.map((addon: ServiceAddon) => (
            <ServiceAddonCard
              key={addon.id}
              addon={addon}
              showControls
              onEdit={() => setEditingAddon(addon)}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Service Add-on</DialogTitle>
            <DialogDescription>
              Create a new service add-on that clients can select during booking.
            </DialogDescription>
          </DialogHeader>
          <ServiceAddonForm
            onSubmit={handleCreateAddon}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingAddon} onOpenChange={(open) => !open && setEditingAddon(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service Add-on</DialogTitle>
            <DialogDescription>
              Update the details of this service add-on.
            </DialogDescription>
          </DialogHeader>
          {editingAddon && (
            <ServiceAddonForm
              initialData={editingAddon}
              onSubmit={handleUpdateAddon}
              onCancel={() => setEditingAddon(null)}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceAddonList;