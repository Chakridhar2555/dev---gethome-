"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Edit2, Trash2, Phone, Mail, MapPin, Eye, Filter, Search, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Lead } from "@/lib/types"

interface LeadFilters {
  leadStatus: string;
  leadType: string;
  leadSource: string;
  leadResponse: string;
  clientType: string;
}

type LeadFormData = {
  name: string;
  email: string;
  phone: string;
  status: string;
  property: string;
  notes: string;
  leadStatus: Lead['leadStatus'];
  leadResponse: Lead['leadResponse'];
  leadSource: Lead['leadSource'];
  leadType: Lead['leadType'];
  clientType: Lead['clientType'];
  callHistory: Lead['callHistory'];
  propertyPreferences: Lead['propertyPreferences'];
  assignedTo: string;
  showings: Lead['showings'];
  tasks: Lead['tasks'];
  location: string;
  age?: number;
  gender?: Lead['gender'];
  language: string;
  religion: string;
  realtorAssociation: {
    name: string;
    membershipNumber: string;
    joinDate: string;
  };
  closedSales: {
    count: number;
    totalValue: number;
    lastClosedDate: string;
  };
  assignedAgent: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  propertyDetails: {
    lastClosedDate: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    yearBuilt: number;
    lotSize: string;
    parking: string;
    features: string[];
  };
};

type LeadStatus = NonNullable<Lead['leadStatus']>;
type LeadSource = NonNullable<Lead['leadSource']>;

const leadStatuses: { value: LeadStatus; label: string }[] = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
  { value: "mild", label: "Mild" }
];

const leadResponses = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "not answering", label: "Not Answering" },
  { value: "not actively answering", label: "Not Actively Answering" },
  { value: "always responding", label: "Always Responding" },
];

const leadSources: { value: LeadSource; label: string }[] = [
  { value: "google ads", label: "Google Ads" },
  { value: "meta", label: "Meta" },
  { value: "refferal", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" }
];

const leadTypes = [
  { value: "Pre construction", label: "Pre Construction" },
  { value: "resale", label: "Resale" },
  { value: "seller", label: "Seller" },
  { value: "buyer", label: "Buyer" },
];

const clientTypes = [
  { value: "Investor", label: "Investor" },
  { value: "custom buyer", label: "Custom Buyer" },
  { value: "first home buyer", label: "First Home Buyer" },
  { value: "seasonal investor", label: "Seasonal Investor" },
  { value: "commercial buyer", label: "Commercial Buyer" },
];

const defaultFormData: LeadFormData = {
  name: "",
  email: "",
  phone: "",
  status: "",
  property: "",
  notes: "",
  leadStatus: "hot",
  leadResponse: "active",
  leadSource: "google ads",
  leadType: "buyer",
  clientType: "first home buyer",
  callHistory: [],
  propertyPreferences: {
    budget: { min: 0, max: 0 },
    propertyType: [],
    bedrooms: 0,
    bathrooms: 0,
    locations: [],
    features: []
  },
  assignedTo: "",
  showings: [],
  tasks: [],
  location: "",
  age: undefined,
  gender: undefined,
  language: "",
  religion: "",
  realtorAssociation: {
    name: "",
    membershipNumber: "",
    joinDate: ""
  },
  closedSales: {
    count: 0,
    totalValue: 0,
    lastClosedDate: ""
  },
  assignedAgent: {
    id: "",
    name: "",
    email: "",
    phone: ""
  },
  propertyDetails: {
    lastClosedDate: "",
    propertyType: "",
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: 0,
    yearBuilt: 0,
    lotSize: "",
    parking: "",
    features: []
  }
};

// Add motion table row
const MotionTableRow = motion(TableRow);

// Update the type definitions
type RealtorAssociationField = 'name' | 'membershipNumber' | 'joinDate';
type ClosedSalesField = 'count' | 'totalValue' | 'lastClosedDate';
type PropertyDetailsField = 'lastClosedDate' | 'propertyType' | 'bedrooms' | 'bathrooms' | 'squareFootage' | 'yearBuilt' | 'lotSize' | 'parking' | 'features';

const LOCATIONS = [
  "All Locations",
  "Toronto",
  "Vancouver",
  "Montreal",
  "Calgary",
  "Ottawa"
];

const LEAD_STATUSES = [
  "All Leads",
  "Hot Leads",
  "Warm Leads",
  "Cold Leads",
  "Mild Leads"
];

export default function LeadsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<LeadFilters>({
    leadStatus: "",
    leadType: "",
    leadSource: "",
    leadResponse: "",
    clientType: ""
  });
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<LeadFormData>(defaultFormData);
  const [isNewLeadDialogOpen, setIsNewLeadDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [showSalesInfo, setShowSalesInfo] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("All Locations");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Leads");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      // Get current user from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      const user = JSON.parse(userData);

      const response = await fetch(`/api/leads?assignedTo=${user._id}&userRole=${user.role}`);
      const data = await response.json();

      // For non-admin users, only show their assigned leads
      if (user.role !== 'Administrator') {
        setLeads(data.filter((lead: Lead) => lead.assignedTo === user._id));
      } else {
        setLeads(data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch leads",
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone || !formData.property) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields (name, email, phone, and property)",
        });
        return;
      }

      const data = {
        ...formData,
        property: typeof formData.property === 'string' ? formData.property : "",
        location: formData.location || "",
        leadSource: formData.leadSource || "google ads",
        leadStatus: formData.leadStatus || "hot"
      };

      let response;
      if (editingLead) {
        // Update existing lead
        response = await fetch(`/api/leads/${editingLead._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new lead
        response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            date: new Date().toISOString()
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save lead');
      }

      const result = await response.json();
      
      if (editingLead) {
        setLeads(prev => prev.map(lead => 
          lead._id === editingLead._id ? result : lead
        ));
      } else {
        setLeads(prev => [...prev, result.lead]);
      }
      
      setIsNewLeadDialogOpen(false);
      setFormData(defaultFormData);
      setEditingLead(null);
      
      toast({
        title: "Success",
        description: `Lead ${editingLead ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save lead",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (lead: Lead) => {
    try {
      const response = await fetch(`/api/leads/${lead._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });

      fetchLeads();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete lead",
      });
    } finally {
      setLeadToDelete(null);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "text-gray-400 bg-gray-400/10";

    switch (status.toLowerCase()) {
      case "cold":
        return "text-blue-400 bg-blue-400/10";
      case "warm":
        return "text-yellow-400 bg-yellow-400/10";
      case "hot":
        return "text-red-400 bg-red-400/10";
      case "mild":
        return "text-green-400 bg-green-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getLeadTypeColor = (type: string | undefined) => {
    switch (type) {
      case "Pre construction":
        return "text-purple-500 bg-purple-500/10";
      case "resale":
        return "text-indigo-500 bg-indigo-500/10";
      case "seller":
        return "text-pink-500 bg-pink-500/10";
      case "buyer":
      default:
        return "text-orange-500 bg-orange-500/10";
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    
    // Safely handle potentially undefined values
    const nameSearch = lead.name ? lead.name.toLowerCase().includes(query) : false;
    const emailSearch = lead.email ? lead.email.toLowerCase().includes(query) : false;
    const phoneSearch = lead.phone ? lead.phone.toLowerCase().includes(query) : false;
    const propertySearch = lead.property ? lead.property.toLowerCase().includes(query) : false;
    
    const matchesSearch =
      nameSearch ||
      emailSearch ||
      phoneSearch ||
      propertySearch;

    // Add location and status filtering
    const matchesLocation = selectedLocation === "All Locations" || lead.location === selectedLocation;
    const matchesStatus = selectedStatus === "All Leads" || 
      lead.leadStatus?.toLowerCase() === selectedStatus.split(" ")[0].toLowerCase();

    const matchesFilters =
      (filters.leadStatus === "" || lead.leadStatus === filters.leadStatus) &&
      (filters.leadType === "" || lead.leadType === filters.leadType) &&
      (filters.leadSource === "" || lead.leadSource === filters.leadSource) &&
      (filters.leadResponse === "" || lead.leadResponse === filters.leadResponse) &&
      (filters.clientType === "" || lead.clientType === filters.clientType) &&
      matchesLocation &&
      matchesStatus;

    return matchesSearch && matchesFilters;
  });

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      ...defaultFormData,
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      status: lead.status || "",
      property: lead.property || "",
      notes: lead.notes || "",
      leadStatus: lead.leadStatus || "hot",
      leadResponse: lead.leadResponse || "active",
      leadSource: lead.leadSource || "google ads",
      leadType: lead.leadType || "buyer",
      clientType: lead.clientType || "first home buyer",
      callHistory: lead.callHistory || [],
      propertyPreferences: lead.propertyPreferences || defaultFormData.propertyPreferences,
      assignedTo: lead.assignedTo || "",
      showings: lead.showings || [],
      tasks: lead.tasks || [],
      location: lead.location || "",
      age: lead.age,
      gender: lead.gender,
      language: lead.language || "",
      religion: lead.religion || "",
      realtorAssociation: lead.realtorAssociation || defaultFormData.realtorAssociation,
      closedSales: lead.closedSales || defaultFormData.closedSales
    });
    setIsNewLeadDialogOpen(true);
  };

  const handleRealtorAssociationChange = (field: RealtorAssociationField, value: string) => {
    setFormData((prev: LeadFormData) => {
      const current = prev.realtorAssociation || {
        name: '',
        membershipNumber: '',
        joinDate: ""
      };
      return {
        ...prev,
        realtorAssociation: {
          name: field === 'name' ? value : current.name,
          membershipNumber: field === 'membershipNumber' ? value : current.membershipNumber,
          joinDate: field === 'joinDate' ? value : current.joinDate
        }
      };
    });
  };

  const handleClosedSalesChange = (field: ClosedSalesField, value: number | string) => {
    setFormData((prev: LeadFormData) => {
      const current = prev.closedSales || {
        count: 0,
        totalValue: 0,
        lastClosedDate: ""
      };
      return {
        ...prev,
        closedSales: {
          count: field === 'count' ? (value as number) : current.count,
          totalValue: field === 'totalValue' ? (value as number) : current.totalValue,
          lastClosedDate: field === 'lastClosedDate' ? (value as string) : current.lastClosedDate
        }
      };
    });
  };

  const handlePropertyDetailsChange = (field: PropertyDetailsField, value: string | number | string[]) => {
    setFormData((prev: LeadFormData) => {
      const current = prev.propertyDetails || {
        lastClosedDate: "",
        propertyType: "",
        bedrooms: 0,
        bathrooms: 0,
        squareFootage: 0,
        yearBuilt: 0,
        lotSize: "",
        parking: "",
        features: []
      };
      return {
        ...prev,
        propertyDetails: {
          lastClosedDate: field === 'lastClosedDate' ? (value as string) : current.lastClosedDate,
          propertyType: field === 'propertyType' ? (value as string) : current.propertyType,
          bedrooms: field === 'bedrooms' ? (value as number) : current.bedrooms,
          bathrooms: field === 'bathrooms' ? (value as number) : current.bathrooms,
          squareFootage: field === 'squareFootage' ? (value as number) : current.squareFootage,
          yearBuilt: field === 'yearBuilt' ? (value as number) : current.yearBuilt,
          lotSize: field === 'lotSize' ? (value as string) : current.lotSize,
          parking: field === 'parking' ? (value as string) : current.parking,
          features: field === 'features' ? (value as string[]) : current.features
        }
      };
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-800 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lead Management</CardTitle>
          </div>
          
          {/* Lead Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {LEAD_STATUSES.map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                className={selectedStatus === status 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "text-gray-700 hover:bg-gray-50"}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Location Filters */}
          <div className="flex flex-wrap gap-2 mt-2">
            {LOCATIONS.map(location => (
              <Button
                key={location}
                variant={selectedLocation === location ? "default" : "outline"}
                className={selectedLocation === location 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "text-gray-700 hover:bg-gray-50"}
                onClick={() => setSelectedLocation(location)}
              >
                {location}
              </Button>
            ))}
          </div>

          {/* Search and Additional Filters */}
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </CardHeader>

        {/* Additional Filters Panel */}
        {showFilters && (
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Lead Type</Label>
                <Select
                  value={filters.leadType}
                  onValueChange={(value) => setFilters({ ...filters, leadType: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {leadTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lead Source</Label>
                <Select
                  value={filters.leadSource}
                  onValueChange={(value) => setFilters({ ...filters, leadSource: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {leadSources.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Client Type</Label>
                <Select
                  value={filters.clientType}
                  onValueChange={(value) => setFilters({ ...filters, clientType: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {clientTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    leadStatus: "",
                    leadType: "",
                    leadSource: "",
                    leadResponse: "",
                    clientType: "",
                  });
                  setSelectedLocation("All Locations");
                  setSelectedStatus("All Leads");
                }}
                className="text-gray-700 hover:bg-gray-50"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}

        <Card className="mt-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Leads</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <MotionTableRow
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <TableCell
                      colSpan={7}
                      className="text-center text-gray-500 py-4"
                    >
                      No leads found
                    </TableCell>
                  </MotionTableRow>
                ) : (
                  filteredLeads.map((lead, index) => (
                    <MotionTableRow
                      key={lead._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
                    >
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                          onClick={() => router.push(`/user/lead/${lead._id}`)}
                        >
                          {lead.name}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-gray-600">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            {lead.email}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            {lead.location || 'No location'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.leadStatus)}`}>
                          {(lead.leadStatus || 'cold').charAt(0).toUpperCase() + (lead.leadStatus || 'cold').slice(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadTypeColor(lead.leadType)}`}>
                          {(lead.leadType || 'buyer').charAt(0).toUpperCase() + (lead.leadType || 'buyer').slice(1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{lead.leadSource || 'Unknown'}</TableCell>
                      <TableCell className="text-gray-600">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/user/lead/${lead._id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(lead)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLeadToDelete(lead)}
                            className="h-8 w-8 p-0 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </MotionTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isNewLeadDialogOpen} onOpenChange={setIsNewLeadDialogOpen}>
          <DialogContent className="max-w-4xl w-[90vw]">
            <DialogHeader>
              <DialogTitle>
                {editingLead ? "Edit Lead" : "Add New Lead"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property">Property</Label>
                  <Input
                    id="property"
                    value={formData.property || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      property: e.target.value
                    })}
                    required
                    placeholder="Enter property details"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadStatus">Status</Label>
                  <Select
                    value={formData.leadStatus || "hot"}
                    onValueChange={(value: string) => setFormData({ ...formData, leadStatus: value as LeadStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadSource">Source</Label>
                  <Select
                    value={formData.leadSource || "google ads"}
                    onValueChange={(value: string) => setFormData({ ...formData, leadSource: value as LeadSource })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadType">Lead Type</Label>
                  <Select
                    value={formData.leadType}
                    onValueChange={(value) => setFormData({ ...formData, leadType: value as Lead['leadType'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ""}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      gender: value as Lead['gender']
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language || ""}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={formData.religion || ""}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowSalesInfo(!showSalesInfo)}>
                  <h3 className="text-lg font-medium">Sales Information</h3>
                  {showSalesInfo ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                {showSalesInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="realtorAssociation">Realtor Association</Label>
                      <Input
                        id="realtorAssociation"
                        value={formData.realtorAssociation?.name || ''}
                        onChange={(e) => handleRealtorAssociationChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="membershipNumber">Membership Number</Label>
                      <Input
                        id="membershipNumber"
                        value={formData.realtorAssociation?.membershipNumber || ''}
                        onChange={(e) => handleRealtorAssociationChange('membershipNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Join Date</Label>
                      <Input
                        id="joinDate"
                        type="date"
                        value={formData.realtorAssociation?.joinDate || ''}
                        onChange={(e) => handleRealtorAssociationChange('joinDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="closedSalesCount">Closed Sales Count</Label>
                      <Input
                        id="closedSalesCount"
                        type="number"
                        value={formData.closedSales?.count || 0}
                        onChange={(e) => handleClosedSalesChange('count', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalValue">Total Value</Label>
                      <Input
                        id="totalValue"
                        type="number"
                        value={formData.closedSales?.totalValue || 0}
                        onChange={(e) => handleClosedSalesChange('totalValue', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastClosedDate">Last Closed Date</Label>
                      <Input
                        id="lastClosedDate"
                        type="date"
                        value={formData.closedSales?.lastClosedDate || ''}
                        onChange={(e) => handleClosedSalesChange('lastClosedDate', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowPropertyDetails(!showPropertyDetails)}>
                  <h3 className="text-lg font-medium">Property Details</h3>
                  {showPropertyDetails ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                {showPropertyDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Input
                        id="propertyType"
                        value={formData.propertyDetails.propertyType}
                        onChange={(e) => handlePropertyDetailsChange('propertyType', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={formData.propertyDetails.bedrooms}
                        onChange={(e) => handlePropertyDetailsChange('bedrooms', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={formData.propertyDetails.bathrooms}
                        onChange={(e) => handlePropertyDetailsChange('bathrooms', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="squareFootage">Square Footage</Label>
                      <Input
                        id="squareFootage"
                        type="number"
                        value={formData.propertyDetails.squareFootage}
                        onChange={(e) => handlePropertyDetailsChange('squareFootage', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        value={formData.propertyDetails.yearBuilt}
                        onChange={(e) => handlePropertyDetailsChange('yearBuilt', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lotSize">Lot Size</Label>
                      <Input
                        id="lotSize"
                        value={formData.propertyDetails.lotSize}
                        onChange={(e) => handlePropertyDetailsChange('lotSize', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parking">Parking</Label>
                      <Input
                        id="parking"
                        value={formData.propertyDetails.parking}
                        onChange={(e) => handlePropertyDetailsChange('parking', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsNewLeadDialogOpen(false);
                    setEditingLead(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white">
                  {editingLead ? "Update" : "Create"} Lead
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the lead
                {leadToDelete && ` "${leadToDelete.name}"`} and remove their data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => leadToDelete && handleDelete(leadToDelete)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
} 