"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserPlus, Edit2, Trash2, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  permissions: {
    dashboard: boolean;
    leads: boolean;
    calendar: boolean;
    email: boolean;
    settings: boolean;
    inventory: boolean;
    favorites: boolean;
  };
}

interface UsersApiResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

const defaultPermissions = {
  dashboard: false,
  leads: false,
  calendar: false,
  email: false,
  settings: false,
  inventory: false,
  favorites: false,
};

const roles = [
  { value: "administrator", label: "Administrator" },
  { value: "developer", label: "Developer" },
  { value: "manager", label: "Manager" },
  { value: "user", label: "User" },
] as const;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "",
    permissions: defaultPermissions,
  });
  const { toast } = useToast();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    console.log('Fetching users...');
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users");
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as UsersApiResponse;
      console.log('Received data:', data);
      
      if (data && Array.isArray(data.users)) {
        console.log('Valid users data received, filtering...');
        const validUsers = data.users.filter((user: User) => 
          user && 
          typeof user._id === 'string' && 
          typeof user.name === 'string' &&
          typeof user.email === 'string'
        );
        console.log('Filtered valid users:', validUsers);
        setUsers(validUsers);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching users');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/users";
      const method = editingUser ? "PUT" : "POST";
      const body = editingUser 
        ? { id: editingUser._id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description: `User ${editingUser ? "updated" : "created"} successfully`,
      });

      setIsNewUserDialogOpen(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "",
        permissions: defaultPermissions,
      });
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editingUser ? "update" : "create"} user`,
      });
    }
  };

  const handleDelete = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading users...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <Button onClick={fetchUsers}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button onClick={() => setIsNewUserDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-8">
            <p>No users found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            username: user.username || "",
                            password: "",
                            role: user.role,
                            permissions: user.permissions || defaultPermissions,
                          });
                          setIsNewUserDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user
                {userToDelete && ` "${userToDelete.name}"`} and remove their data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => userToDelete && handleDelete(userToDelete)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              {editingUser ? (
                <div className="space-y-2">
                  <Label htmlFor="password">Change Password</Label>
                  <div className="space-y-4">
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Enter new password (leave empty to keep current)"
                      minLength={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave blank to keep the current password. Enter a new password (minimum 6 characters) to change it.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(formData.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [key]: checked === true,
                            },
                          })
                        }
                        disabled={formData.role.toLowerCase() === 'administrator'}
                      />
                      <Label 
                        htmlFor={key} 
                        className={`capitalize ${formData.role.toLowerCase() === 'administrator' ? 'text-gray-500' : ''}`}
                      >
                        {key}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.role.toLowerCase() === 'administrator' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Administrator role has all permissions enabled by default
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsNewUserDialogOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white">
                  {editingUser ? "Update" : "Create"} User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 