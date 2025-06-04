import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { NearbyHealthcareOption } from '../../types';
import Button from '../common/Button';

interface NearbyFacilitiesMapProps {
  facilities: NearbyHealthcareOption[];
}

const NearbyFacilitiesMap: React.FC<NearbyFacilitiesMapProps> = ({ 
  facilities 
}) => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<NearbyHealthcareOption | null>(null);
  
  // Try to get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);
  
  // Open directions in external map
  const openDirections = (facility: NearbyHealthcareOption) => {
    if (!userLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(facility.address)}`;
    window.open(url, '_blank');
  };
  
  // Handle facility selection
  const handleFacilityClick = (facility: NearbyHealthcareOption) => {
    setSelectedFacility(facility);
  };
  
  if (facilities.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200">
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-medium text-neutral-800 mb-4">
          {t('results.nearbyFacilities')}
        </h3>
        
        {/* Facility list */}
        <div className="mb-4 grid gap-3">
          {facilities.map((facility, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedFacility === facility
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
              onClick={() => handleFacilityClick(facility)}
            >
              <div className="flex items-start">
                <MapPin className={`w-5 h-5 mr-2 mt-0.5 ${
                  facility.type === 'hospital' 
                    ? 'text-error-500' 
                    : facility.type === 'clinic'
                      ? 'text-primary-500'
                      : 'text-accent-500'
                }`} />
                
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-800">{facility.name}</h4>
                  
                  <div className="flex items-center text-xs text-neutral-600 mb-1">
                    <span className="capitalize">{facility.type}</span>
                    {facility.distance && (
                      <span className="ml-2">
                        {t('results.distanceAway', { distance: facility.distance })}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-2">{facility.address}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {facility.contactInfo && (
                      <a 
                        href={`tel:${facility.contactInfo}`}
                        className="text-xs flex items-center text-primary-600"
                      >
                        <Phone size={12} className="mr-1" />
                        {facility.contactInfo}
                      </a>
                    )}
                    
                    {facility.availability && (
                      <span className="text-xs flex items-center text-neutral-600">
                        <Clock size={12} className="mr-1" />
                        {facility.availability}
                      </span>
                    )}
                    
                    {facility.cost && (
                      <span className="text-xs text-neutral-600">
                        Cost: {facility.cost}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Action buttons */}
        {selectedFacility && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="small"
              onClick={() => openDirections(selectedFacility)}
              icon={<ExternalLink size={14} />}
              disabled={!userLocation}
            >
              {t('emergency.getDirections')}
            </Button>
            
            {selectedFacility.contactInfo && (
              <Button
                variant="outline"
                size="small"
                as="a"
                href={`tel:${selectedFacility.contactInfo}`}
                icon={<Phone size={14} />}
              >
                {t('emergency.callNow')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyFacilitiesMap;