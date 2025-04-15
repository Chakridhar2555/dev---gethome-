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
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        console.log('Parsed Excel data:', jsonData);

        const leads: Partial<Lead>[] = jsonData.map((row: any) => {
          // Get the first non-empty value from the row for each field
          const getFieldValue = (possibleKeys: string[]) => {
            for (const key of possibleKeys) {
              const value = row[key];
              if (value !== undefined && value !== '') {
                return value.toString().trim();
              }
            }
            return '';
          };

          // Extract name, email and phone based on column position and possible header names
          const name = getFieldValue([
            '0', // First column
            'Name',
            'name',
            'NAME',
            Object.keys(row)[0] // Fallback to first column if no match
          ]);

          const email = getFieldValue([
            '1', // Second column
            'Email',
            'email',
            'EMAIL',
            Object.keys(row)[1] // Fallback to second column if no match
          ]);

          const phone = getFieldValue([
            '2', // Third column
            'Phone',
            'phone',
            'PHONE',
            'Mobile',
            'mobile',
            'Contact',
            Object.keys(row)[2] // Fallback to third column if no match
          ]);

          // Generate a unique ID for each lead
          const _id = uuidv4();
          
          return {
            _id,
            name: name || 'Unnamed Lead',
            email: email || 'no-email@example.com',
            phone: phone || '000-000-0000',
            // Default values for remaining fields
            leadStatus: 'cold',
            leadType: 'buyer',
            leadSource: 'refferal',
            leadResponse: 'inactive',
            clientType: 'custom buyer',
            property: 'Unspecified Property',
            location: '',
            notes: 'Imported from Excel file. Additional information to be added manually.',
            date: new Date().toISOString(),
            callHistory: [],
            tasks: [],
            propertyPreferences: {
              budget: {
                min: 0,
                max: 0
              },
              propertyType: [],
              bedrooms: 0,
              bathrooms: 0,
              locations: [],
              features: []
            }
          };
        });

        // Filter out any leads that don't have either a name, email, or phone
        const validLeads = leads.filter(lead => 
          lead.name !== 'Unnamed Lead' || 
          lead.email !== 'no-email@example.com' || 
          lead.phone !== '000-000-0000'
        );

        console.log('Processed leads:', validLeads);
        resolve(validLeads);
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