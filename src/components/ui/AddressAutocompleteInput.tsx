'use client';

import React, { useEffect, useRef, forwardRef, useState } from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getDetails,
} from 'use-places-autocomplete';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AddressDetails {
  address1: string;
  city: string;
  region: string; // state/province
  zip: string;
  country: string;
}

export interface AddressAutocompleteInputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (addressDetails: AddressDetails) => void;
  error?: string;
}

const AddressAutocompleteInput = forwardRef<
  HTMLInputElement, 
  AddressAutocompleteInputProps
>(({
  label,
  value,
  onChange,
  onAddressSelect,
  error,
  id,
  disabled,
  placeholder = 'Start typing your address...',
  className = '',
  ...props
}, ref) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const loaderRef = useRef<Loader | null>(null);
  
  const {
    ready,
    suggestions: { status, data },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: ['us', 'ca'] }, // Restrict to US and Canada
    },
    debounce: 300,
    cache: 86400, // Cache results for 24 hours
    defaultValue: value,
  });

  // Load Google Maps API
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing.');
      return;
    }
    
    if (!loaderRef.current) {
      loaderRef.current = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: 'weekly',
        libraries: ['places'],
      });
    }

    if (!isInitialized) {
      loaderRef.current.load()
        .then(() => {
          setIsInitialized(true);
        })
        .catch(e => {
          console.error('Error loading Google Maps API:', e);
        });
    }
  }, [isInitialized]);

  // Sync the external value with internal state
  useEffect(() => {
    setAutocompleteValue(value, false);
  }, [value, setAutocompleteValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAutocompleteValue(newValue, true);
    onChange(newValue);
  };

  const handleSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    clearSuggestions();
    const selectedValue = suggestion.description;
    setAutocompleteValue(selectedValue, false);
    onChange(selectedValue);

    if (!onAddressSelect) return;

    try {
      const results = await getGeocode({ address: selectedValue });
      const placeDetails = await getDetails({ placeId: suggestion.place_id });
      
      let address1 = '';
      let city = '';
      let region = ''; 
      let zip = '';
      let country = '';

      if (typeof placeDetails !== 'string' && placeDetails.address_components) {
        const components: google.maps.GeocoderAddressComponent[] = placeDetails.address_components;
        
        // Extract address components
        const streetNumber = components.find(c => c.types.includes('street_number'))?.long_name;
        const route = components.find(c => c.types.includes('route'))?.short_name;
        
        if (streetNumber && route) {
          address1 = `${streetNumber} ${route}`;
        } else {
          address1 = components.find(c => c.types.includes('sublocality_level_1'))?.long_name || 
                     components.find(c => c.types.includes('locality'))?.long_name || '';
        }

        city = components.find(c => c.types.includes('locality'))?.long_name || 
               components.find(c => c.types.includes('postal_town'))?.long_name || '';
               
        region = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || '';
        zip = components.find(c => c.types.includes('postal_code'))?.long_name || '';
        country = components.find(c => c.types.includes('country'))?.short_name || '';
        
        // Fallback for city
        if (!city) {
          city = components.find(c => c.types.includes('administrative_area_level_2'))?.long_name || 
                 components.find(c => c.types.includes('sublocality'))?.long_name || '';
        }
      }
      
      onAddressSelect({
        address1,
        city,
        region,
        zip,
        country,
      });

    } catch (error) {
      console.error('Error getting address details:', error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor={id} className="mb-1 block">{label}</Label>
      <Input
        {...props}
        id={id}
        ref={ref}
        value={value}
        onChange={handleInputChange}
        disabled={!ready || disabled}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full"
        aria-invalid={!!error}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      
      {status === 'OK' && data.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          {data.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
      
      {!ready && !isInitialized && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <p className="text-xs text-gray-400 mt-1">Initializing address lookup...</p>
      )}
      
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <p className="text-xs text-red-500 mt-1">Address lookup disabled: API key missing.</p>
      )}
    </div>
  );
});

AddressAutocompleteInput.displayName = 'AddressAutocompleteInput';

export default AddressAutocompleteInput;