import { Shield, ShieldCheck, UserCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsers } from "@/features/user/user-hooks";
import { authClient } from "@/lib/auth/auth-client";
import { canManageUsers, type UserRole } from "@/lib/auth/permissions";

export function AdminOverview() {
  const { data: users, isLoading } = useUsers();
  const { data: session } = authClient.useSession();

  const currentUserRole = (session?.user?.role as UserRole) || "user";

  if (!canManageUsers(currentUserRole)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground">Access Denied</h3>
          <p className="text-sm text-muted-foreground">
            You don't have permission to access admin features.
          </p>
        </div>
      </div>
    );
  }

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((user) => user.emailVerified && !user.banned).length || 0;
  const bannedUsers = users?.filter((user) => user.banned).length || 0;
  const adminUsers =
    users?.filter((user) => user.role === "admin" || user.role === "superadmin").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Manage users and monitor system activity</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Verified and active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Admin and superadmin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bannedUsers}</div>
            <p className="text-xs text-muted-foreground">Suspended accounts</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Admin Permissions</CardTitle>
          <CardDescription>
            Current role: <Badge variant="outline">{currentUserRole}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Manage Users</span>
              <Badge variant={canManageUsers(currentUserRole) ? "default" : "secondary"}>
                {canManageUsers(currentUserRole) ? "Allowed" : "Denied"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Ban/Unban Users</span>
              <Badge
                variant={
                  currentUserRole === "admin" || currentUserRole === "superadmin"
                    ? "default"
                    : "secondary"
                }
              >
                {currentUserRole === "admin" || currentUserRole === "superadmin"
                  ? "Allowed"
                  : "Denied"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Delete Users</span>
              <Badge variant={currentUserRole === "superadmin" ? "default" : "secondary"}>
                {currentUserRole === "superadmin" ? "Allowed" : "Denied"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
