import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facilityService } from '../services/facilityService';
import { Facility } from '../types';
import FacilityForm from '../components/FacilityForm';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditFacility() {
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      facilityService.getById(id)
        .then(setFacility)
        .catch((err) => {
          toast.error('Failed to load facility');
          navigate('/my-contributions');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!facility) return null;

  return <FacilityForm initialData={facility} isEditing />;
}
