import { useQuery } from "@tanstack/react-query";
import { Key, Laptop, Shield, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth/auth-client";

import { activeSessionsQueryOptions, useAuthHelpers } from "../auth/auth-hooks";

export function SecuritySettings() {
  const { data: session } = authClient.useSession();
  const { revokeSession } = useAuthHelpers();
  const [settings, setSettings] = useState({
    twoFactorEnabled: session?.user?.twoFactorEnabled,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    autoSessionTimeout: false,
  });

  // Mock active sessions data
  // const activeSessions = [
  //   {
  //     id: "1",
  //     device: "MacBook Pro",
  //     browser: "Chrome 120",
  //     location: "San Francisco, CA",
  //     ip: "192.168.1.1",
  //     lastActive: "Current session",
  //     current: true,
  //   },
  //   {
  //     id: "2",
  //     device: "iPhone 15",
  //     browser: "Safari Mobile",
  //     location: "San Francisco, CA",
  //     ip: "192.168.1.2",
  //     lastActive: "2 hours ago",
  //     current: false,
  //   },
  //   {
  //     id: "3",
  //     device: "Windows PC",
  //     browser: "Edge 119",
  //     location: "New York, NY",
  //     ip: "10.0.0.1",
  //     lastActive: "1 day ago",
  //     current: false,
  //   },
  // ];
  const activeSessions = useQuery(activeSessionsQueryOptions);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    // TODO: Implement actual settings update with Better-auth
    console.log(`Setting ${key} changed to ${value}`);
  };

  const handleTerminateSession = (token: string) => {
    console.log(`Terminating session with token: ${token}`);
    revokeSession.mutate({ token });
  };

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Enable Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                {settings.twoFactorEnabled
                  ? "Your account is protected with 2FA"
                  : "Secure your account with an additional verification step"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {settings.twoFactorEnabled && (
                <Badge className="border-green-200 text-green-600" variant="outline">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Enabled
                </Badge>
              )}
              <Switch
                checked={!!settings.twoFactorEnabled}
                onCheckedChange={(checked) => handleSettingChange("twoFactorEnabled", checked)}
              />
            </div>
          </div>

          {settings.twoFactorEnabled && (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is currently enabled using your authenticator app.
                <div className="mt-2 space-x-2">
                  <Button size="sm" variant="outline">
                    View Recovery Codes
                  </Button>
                  <Button size="sm" variant="outline">
                    Regenerate Codes
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Security Preferences</CardTitle>
          <CardDescription>Customize your security and notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Login Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone signs into your account
              </p>
            </div>
            <Switch
              checked={settings.loginNotifications}
              onCheckedChange={(checked) => handleSettingChange("loginNotifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Suspicious Activity Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get alerts for unusual account activity
              </p>
            </div>
            <Switch
              checked={settings.suspiciousActivityAlerts}
              onCheckedChange={(checked) =>
                handleSettingChange("suspiciousActivityAlerts", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Auto Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sign out after 30 minutes of inactivity
              </p>
            </div>
            <Switch
              checked={settings.autoSessionTimeout}
              onCheckedChange={(checked) => handleSettingChange("autoSessionTimeout", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage devices that are currently signed into your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(activeSessions?.data || []).map((activeSession) => (
            <div
              className="flex items-center justify-between rounded-lg border p-4"
              key={activeSession.id}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Laptop className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activeSession.ipAddress}</p>
                    {activeSession.token === session?.session.token && (
                      <Badge className="text-xs" variant="outline">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{activeSession.userAgent}</p>
                  {/*<div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {activeSession.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activeSession.lastActive}
                    </div>
                  </div>*/}
                </div>
              </div>
              {activeSession.token !== session?.session.token && (
                <Button
                  onClick={() => handleTerminateSession(activeSession.id)}
                  size="sm"
                  variant="outline"
                >
                  {revokeSession.isPending ? <Spinner /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Terminate
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Actions</CardTitle>
          <CardDescription>Additional security management options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button className="justify-start" variant="outline">
              Change Password
            </Button>
            <p className="ml-0 text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
          </div>

          <Separator />

          <div className="flex flex-col space-y-2">
            <Button className="justify-start" variant="outline">
              Sign Out All Devices
            </Button>
            <p className="ml-0 text-sm text-muted-foreground">
              This will sign you out of all devices except this one
            </p>
          </div>

          <Separator />

          <div className="flex flex-col space-y-2">
            <Button className="justify-start text-destructive" variant="outline">
              Download Account Data
            </Button>
            <p className="ml-0 text-sm text-muted-foreground">
              Download a copy of your account data and activity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
