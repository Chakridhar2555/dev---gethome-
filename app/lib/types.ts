import { leadStatuses, leadResponses, leadSources, leadTypes, clientTypes } from './constants';

type ValueOf<T> = T[keyof T];

export type LeadStatus = typeof leadStatuses[number]['value'];
export type LeadResponse = typeof leadResponses[number]['value'];
export type LeadSource = typeof leadSources[number]['value'];
export type LeadType = typeof leadTypes[number]['value'];
export type ClientType = typeof clientTypes[number]['value'];

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface RealtorAssociation {
  name: string;
  membershipNumber: string;
  joinDate: string;
}

export interface ClosedSales {
  count: number;
  totalValue: number;
  lastClosedDate: string;
}

export interface PropertyPreferences {
  budget: {
    min: number;
    max: number;
  };
  locations: string[];
  features: string[];
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface Call {
  id: string;
  date: string;
  duration: number;
  notes: string;
  outcome: string;
}

export interface Showing {
  id: string;
  propertyId: string;
  date: string;
  time: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: Gender;
  language: string;
  religion: string;
  location: string;
  property: string;
  notes: string;
  leadStatus: LeadStatus;
  leadResponse: LeadResponse;
  leadSource: LeadSource;
  leadType: LeadType;
  clientType: ClientType;
  realtorAssociation: RealtorAssociation;
  closedSales: ClosedSales;
  propertyPreferences: PropertyPreferences;
  callHistory: Call[];
  showings: Showing[];
  tasks: Task[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
} 