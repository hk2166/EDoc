import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Clock, Navigation2 } from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface Hospital {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  phone?: string;
  type: 'hospital' | 'clinic' | 'pharmacy';
  distance?: number;
  openingHours?: string;
}

const HospitalFinder: React.FC = () => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Custom marker icon
  const hospitalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        try {
          // Use environment variable for API key
          const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
          if (!apiKey) {
            throw new Error('Geoapify API key not found');
          }

          const response = await fetch(
            `https://api.geoapify.com/v2/places?categories=healthcare.hospital,healthcare.clinic,healthcare.pharmacy&filter=circle:${longitude},${latitude},5000&limit=10&apiKey=${apiKey}`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch hospitals');
          }

          const data = await response.json();
          
          const formattedHospitals = data.features
            .filter((feature: any) => feature.properties.lat && feature.properties.lon)
            .map((feature: any) => ({
              id: feature.properties.place_id,
              name: feature.properties.name || 'Unknown Healthcare Facility',
              lat: feature.properties.lat,
              lon: feature.properties.lon,
              address: feature.properties.formatted || feature.properties.address_line1 || 'Address unavailable',
              phone: feature.properties.phone,
              type: getHealthcareType(feature.properties.categories),
              distance: calculateDistance(
                latitude,
                longitude,
                feature.properties.lat,
                feature.properties.lon
              ),
              openingHours: feature.properties.opening_hours
            }));

          setHospitals(formattedHospitals);
        } catch (err) {
          console.error('Error fetching hospitals:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch hospitals');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Failed to get your location. Please enable location services.');
        setLoading(false);
      }
    );
  }, []);

  // Helper function to determine healthcare facility type
  const getHealthcareType = (categories: string[]): Hospital['type'] => {
    if (categories.includes('healthcare.hospital')) return 'hospital';
    if (categories.includes('healthcare.clinic')) return 'clinic';
    return 'pharmacy';
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  };

  // Open directions in Google Maps
  const openDirections = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" label={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-error-50 rounded-lg border border-error-200">
        <MapPin className="w-12 h-12 text-error-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-error-700 mb-2">{error}</h3>
        <p className="text-error-600 mb-4">
          Please check your internet connection and location settings.
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {userLocation && (
        <div className="h-[400px] relative">
          <MapContainer
            center={userLocation}
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location marker */}
            <Marker position={userLocation}>
              <Popup>You are here</Popup>
            </Marker>

            {/* Hospital markers */}
            {hospitals.map((hospital) => (
              <Marker
                key={hospital.id}
                position={[hospital.lat, hospital.lon]}
                icon={hospitalIcon}
                eventHandlers={{
                  click: () => setSelectedHospital(hospital)
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-medium text-neutral-800">{hospital.name}</h3>
                    <p className="text-sm text-neutral-600">{hospital.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Hospital list */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-neutral-800">
            Nearby Healthcare Facilities
          </h2>
          <span className="text-sm text-neutral-500">
            {hospitals.length} {t('emergency.facilitiesFound')}
          </span>
        </div>

        <div className="space-y-4">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className={`p-4 rounded-lg border ${
                selectedHospital?.id === hospital.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-300'
              } cursor-pointer transition-colors`}
              onClick={() => setSelectedHospital(hospital)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-neutral-800">{hospital.name}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{hospital.address}</p>
                  {hospital.distance && (
                    <p className="text-sm text-neutral-500 mt-1">
                      {hospital.distance} km away
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => openDirections(hospital)}
                >
                  <Navigation2 className="w-4 h-4 mr-1" />
                  {t('emergency.directions')}
                </Button>
              </div>

              <div className="mt-3 flex items-center space-x-4 text-sm text-neutral-600">
                {hospital.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    <a href={`tel:${hospital.phone}`} className="hover:text-primary-500">
                      {hospital.phone}
                    </a>
                  </div>
                )}
                {hospital.openingHours && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{hospital.openingHours}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalFinder;