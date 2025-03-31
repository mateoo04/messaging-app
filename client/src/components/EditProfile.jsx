import { useAuth } from '../context/authContext';
import personSvg from '../assets/icons/person-circle.svg';
import supabase from '../utils/supabase';
import { useState } from 'react';
import { toast } from 'react-toastify';
import arrowLeftSvg from '../assets/icons/arrow-left.svg';
import { Link } from 'react-router-dom';
import { validateFile } from '../utils/fileValidation';

export default function EditProfile() {
  const { authenticatedUser, setAuthenticatedUser } = useAuth();
  const [file, setFile] = useState();
  const [displayName, setDisplayName] = useState(authenticatedUser.displayName);

  const saveChanges = async (event) => {
    event.preventDefault();

    if (!file && !displayName) {
      toast.error('No changes');
      return;
    }

    const isValidImage = file && validateFile(file);

    try {
      if (!isValidImage && displayName) {
        updateUser(`/api/users/update?displayName=${displayName}`);
      } else {
        const filePath = `profile-photos/${authenticatedUser.id}-${Date.now()}`;

        const { data, error } = await supabase.storage
          .from('messaging-app')
          .upload(filePath, file, {
            upsert: true,
          });

        if (error) {
          throw new Error(error);
        }

        const { data: profilePhotoUrlData } = supabase.storage
          .from('messaging-app')
          .getPublicUrl(data.path);

        if (displayName)
          updateUser(
            `/api/users/update?profilePhotoUrl=${profilePhotoUrlData.publicUrl}&displayName=${displayName}`
          );
        else if (!displayName)
          updateUser(
            `/api/users/update?profilePhotoUrl=${profilePhotoUrlData.publicUrl}`
          );
      }
    } catch (error) {
      toast.error('Error saving the profile photo');
    }
  };

  const updateUser = async (url) => {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Error saving the profile photo');

    const json = await response.json();

    if (json.success) {
      setAuthenticatedUser(json.user);
    }
  };

  return (
    <main className='container'>
      <div className='d-flex gap-3 align-items-center'>
        <Link to='/'>
          <img className='back-arrow' src={arrowLeftSvg} alt='' />
        </Link>
        <h1 className='mt-3 mb-3'>Your Profile</h1>
      </div>
      <div className='d-flex gap-3 align-items-center mb-3'>
        {' '}
        <img
          className='edit-profile-photo'
          src={authenticatedUser.profilePhotoUrl || personSvg}
          alt=''
        />
        <h2>@{authenticatedUser.username}</h2>
      </div>
      <form
        onSubmit={saveChanges}
        className='d-flex flex-column border p-3 rounded-3'
      >
        <legend>Edit profile</legend>
        <label htmlFor='displayName' className='mb-3'>
          Display name
          <input
            id='displayName'
            name='displayName'
            className='form-control'
            type='text'
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <label htmlFor='file' className='mb-3'>
          New profile photo
          <input
            id='file-input'
            type='file'
            name='file'
            className='form-control mb-3'
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <input
          type='submit'
          value='SAVE CHANGES'
          className='btn bg-primary text-white'
        />
      </form>
    </main>
  );
}
