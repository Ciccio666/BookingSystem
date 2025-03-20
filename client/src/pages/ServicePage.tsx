import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Service } from "@/lib/types";
import ServiceCard from "@/components/services/ServiceCard";
import { Skeleton } from "@/components/ui/skeleton";

const ServicePage = () => {
  const [, navigate] = useLocation();
  
  // Fetch services from API
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
  });
  
  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    // Navigate to booking page with selected service
    navigate(`/bookings?serviceId=${service.id}`);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">Select a Service</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden border border-neutral-200">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-neutral-800 mb-4">Oops! Something went wrong</h1>
        <p className="text-neutral-600 mb-6">We couldn't load the services. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Select a Service</h1>
      
      {services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: Service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={handleServiceSelect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-600">No services available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ServicePage;
