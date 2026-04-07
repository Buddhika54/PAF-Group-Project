import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResourceForm from './ResourceForm';
import { resourceAPI } from '../../services/resourceAPI';

export default function EditResource() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    resourceAPI.getById(id).then(r => setData(r.data));
  }, [id]);

  const submit = async (form) => {
    await resourceAPI.update(id, form);
    nav('/admin/resources');
  };

  if (!data) return <div>Loading...</div>;

  return <ResourceForm onSubmit={submit} initialData={data} />;
}