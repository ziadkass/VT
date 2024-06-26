import React, { useState } from 'react';
import axios from 'axios';

const ImportElectionsButton = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const elections = JSON.parse(event.target.result);

        // Récupération du jeton depuis le localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No token found, please log in first.');
          return;
        }

        const response = await axios.post('http://localhost:5003/api/admin/elections/import', elections, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alert('Elections imported successfully');
      } catch (error) {
        console.error('Error importing elections:', error);
        alert('Failed to import elections');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button onClick={handleImport}>Import Elections</button>
    </div>
  );
};

export default ImportElectionsButton;
