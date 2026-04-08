import ResourceForm from './ResourceForm';
import { resourceAPI } from '../../services/resourceAPI';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AddResource() {
  const nav = useNavigate();

  const submit = async (data) => {
    await resourceAPI.create(data);
    toast.success('Created');
    nav('/admin/resources');
  };

  return <ResourceForm onSubmit={submit} />;
}
