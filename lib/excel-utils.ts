import * as XLSX from 'xlsx';
import { Lead } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export const parseExcelLeads = (file: File): Promise<Partial<Lead>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Parsed Excel data:', jsonData);

        const leads: Partial<Lead>[] = jsonData.map((row: any) => {
          // Generate a unique ID for each lead
          const _id = uuidv4();
          
          // Helper function to safely get a value with fallbacks
          const getValue = (field: string, defaultValue: any = '') => {
            // Try different case variations of the field name
            return row[field] || 
                   row[field.charAt(0).toUpperCase() + field.slice(1)] || 
                   row[field.toUpperCase()] || 
                   defaultValue;
          };
          
          // Map Excel columns to lead properties with default values
          return {
            _id,
            name: getValue('name', 'Unnamed Lead'),
            email: getValue('email', 'no-email@example.com'),
            phone: getValue('phone', '000-000-0000'),
            leadStatus: getValue('leadStatus', 'cold'),
            leadType: getValue('leadType', 'buyer'),
            leadSource: getValue('leadSource', 'google ads'),
            leadResponse: getValue('leadResponse', 'inactive'),
            clientType: getValue('clientType', 'custom buyer'),
            property: getValue('property', 'Unspecified Property'),
            location: getValue('location', ''),
            notes: getValue('notes', ''),
            date: new Date().toISOString(),
            callHistory: [],
            tasks: [],
            propertyPreferences: {
              budget: {
                min: getValue('budgetMin', 0),
                max: getValue('budgetMax', 0)
              },
              propertyType: Array.isArray(getValue('propertyType')) ? 
                getValue('propertyType') : 
                getValue('propertyType') ? [getValue('propertyType')] : [],
              bedrooms: getValue('bedrooms', 0),
              bathrooms: getValue('bathrooms', 0),
              locations: Array.isArray(getValue('locations')) ? 
                getValue('locations') : 
                getValue('locations') ? [getValue('locations')] : [],
              features: Array.isArray(getValue('features')) ? 
                getValue('features') : 
                getValue('features') ? [getValue('features')] : []
            }
          };
        });

        console.log('Processed leads:', leads);
        resolve(leads);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
}; 