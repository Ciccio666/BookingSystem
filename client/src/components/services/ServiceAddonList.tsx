import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceAddon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, AlertTriangle, MoveVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { apiRequest } from '@/lib/queryClient';
import ServiceAddonCard from './ServiceAddonCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ServiceAddonForm from './ServiceAddonForm';
import { useToast } from '@/hooks/use-toast';

const ServiceAddonList = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<ServiceAddon | null>(null);
  const { toast } = useToast();
  
  const queryClient = useQueryClient();
  
  const { data: addons = [], isLoading, error } = useQuery<ServiceAddon[]>({
    queryKey: ['/api/service-addons'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const createAddonMutation = useMutation({
    mutationFn: async (newAddon: any) => {
      return apiRequest('POST', '/api/service-addons', newAddon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-addons'] });
      setIsAddModalOpen(false);
      toast({
        title: "Add-on created",
        description: "The service add-on has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating add-on",
        description: error.message || "There was an error creating the service add-on.",
        variant: "destructive",
      });
    },
  });
  
  const updateAddonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PATCH', `/api/service-addons/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-addons'] });
      setEditingAddon(null);
      toast({
        title: "Add-on updated",
        description: "The service add-on has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating add-on",
        description: error.message || "There was an error updating the service add-on.",
        variant: "destructive",
      });
    },
  });
  
  const updateAddonOrderMutation = useMutation({
    mutationFn: async (addonIds: number[]) => {
      return apiRequest('POST', '/api/service-addons/order', { addonIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-addons'] });
      toast({
        title: "Order updated",
        description: "The add-on order has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating order",
        description: error.message || "There was an error updating the order.",
        variant: "destructive",
      });
    },
  });
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) return;
    
    const newOrderedItems = Array.from(addons);
    const [removed] = newOrderedItems.splice(startIndex, 1);
    newOrderedItems.splice(endIndex, 0, removed);
    
    // Get array of addon IDs in the new order
    const newOrderIds = newOrderedItems.map(addon => addon.id);
    
    // Update order in the backend
    updateAddonOrderMutation.mutate(newOrderIds);
  };
  
  const handleToggleActive = (addon: ServiceAddon) => {
    updateAddonMutation.mutate({
      id: addon.id,
      data: { active: !addon.active }
    });
  };
  
  const handleEditAddon = (addon: ServiceAddon) => {
    setEditingAddon(addon);
  };
  
  const handleCreateAddon = async (data: any) => {
    await createAddonMutation.mutateAsync(data);
  };
  
  const handleUpdateAddon = async (data: any) => {
    if (editingAddon) {
      await updateAddonMutation.mutateAsync({ id: editingAddon.id, data });
    }
  };
  
  if (isLoading) {
    return <div className="p-6">Loading service add-ons...</div>;
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load service add-ons. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Service Add-ons</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Add-on
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Manage Add-ons</h3>
            <div className="flex items-center text-sm text-gray-500">
              <MoveVertical className="h-4 w-4 mr-1" />
              <span>Drag to reorder</span>
            </div>
          </div>
        </div>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="service-addons">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addons.map((addon, index) => (
                    <Draggable key={addon.id.toString()} draggableId={addon.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ServiceAddonCard
                            addon={addon}
                            showControls={true}
                            onEdit={handleEditAddon}
                            onToggleActive={handleToggleActive}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      {/* Add Add-on Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Service Add-on</DialogTitle>
          </DialogHeader>
          <ServiceAddonForm 
            onSubmit={handleCreateAddon} 
            onCancel={() => setIsAddModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Add-on Modal */}
      <Dialog open={!!editingAddon} onOpenChange={(open) => !open && setEditingAddon(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service Add-on</DialogTitle>
          </DialogHeader>
          {editingAddon && (
            <ServiceAddonForm 
              initialData={editingAddon}
              onSubmit={handleUpdateAddon} 
              onCancel={() => setEditingAddon(null)} 
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceAddonList;