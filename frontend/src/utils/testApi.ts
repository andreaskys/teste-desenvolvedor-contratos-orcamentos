import api from './api/client';
import { useAuthStore } from './store/authStore';

// This is a test script to be run in a browser console or via a temporary component
export const testCreateTemplate = async () => {
  try {
    const res = await api.post('/templates', {
      name: 'Test Template',
      content: 'Hello {{name}}',
      fields: [{ label: 'Name', key: 'name', type: 'text', required: true }]
    });
    console.log('Test Success:', res.data);
  } catch (err) {
    console.error('Test Failed:', err);
  }
};
