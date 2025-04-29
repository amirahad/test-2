import { PageHeader } from "@/components/ui/page-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Textarea } from "@/components/ui/textarea";
import {
  UserCircle,
  FileText,
  Database,
  Palette,
  ArrowUpFromLine,
  Save,
  Upload,
  Trash2,
  Edit2,
  X,
  Plus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Estate Dashboard");
  const [logoUrl, setLogoUrl] = useState("");
  const [themeColor, setThemeColor] = useState("blue-600");
  const [backgroundStyle, setBackgroundStyle] = useState("solid");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  // Load settings on component mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);

        // Get branding settings
        const brandingResponse = await fetch("/api/settings/category/branding");
        if (brandingResponse.ok) {
          const brandingSettings = await brandingResponse.json();

          // Find company name setting
          const nameSetting = brandingSettings.find(
            (s: any) => s.key === "company_name",
          );
          if (nameSetting) {
            setCompanyName(nameSetting.value);
          }

          // Find logo setting
          const logoSetting = brandingSettings.find(
            (s: any) => s.key === "company_logo",
          );
          if (logoSetting && logoSetting.value) {
            setLogoUrl(logoSetting.value);
          }
        }

        // Get TV view settings
        const tvViewResponse = await fetch("/api/settings/category/tv_view");
        if (tvViewResponse.ok) {
          const tvViewSettings = await tvViewResponse.json();

          // Find theme color setting
          const colorSetting = tvViewSettings.find(
            (s: any) => s.key === "tv_theme_color",
          );
          if (colorSetting) {
            setThemeColor(colorSetting.value);
          }

          // Find background style setting
          const bgSetting = tvViewSettings.find(
            (s: any) => s.key === "tv_background_style",
          );
          if (bgSetting) {
            setBackgroundStyle(bgSetting.value);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Handle logo upload
  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      setError(
        "Please select a valid image file (JPEG, PNG, GIF, SVG, or WEBP)",
      );
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size exceeds 2MB limit");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload logo");
      }

      const result = await response.json();

      if (result.success) {
        setLogoUrl(result.filePath);

        // Save the logo path in settings
        await fetch("/api/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: "company_logo",
            value: result.filePath,
            category: "branding",
          }),
        });
      } else {
        throw new Error(result.message || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle remove logo
  const handleRemoveLogo = async () => {
    if (!logoUrl) return;

    try {
      // Only call the API if the image is from our uploads
      if (logoUrl.startsWith("/uploads/")) {
        await fetch("/api/upload/profile", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: logoUrl }),
        });
      }

      // Update settings
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "company_logo",
          value: "",
          category: "branding",
        }),
      });

      // Clear logo URL
      setLogoUrl("");
    } catch (error) {
      console.error("Error removing logo:", error);
    }
  };

  // Handle save settings
  const saveSettings = async () => {
    try {
      // Save company name
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "company_name",
          value: companyName,
          category: "branding",
        }),
      });

      // Save theme color
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "tv_theme_color",
          value: themeColor,
          category: "tv_view",
        }),
      });

      // Save background style
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "tv_background_style",
          value: backgroundStyle,
          category: "tv_view",
        }),
      });

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageHeader
            title="Settings"
            subtitle="Manage your account and application preferences"
          />

          <div className="mt-6">
            <Tabs defaultValue="account" className="space-y-4">
              <TabsList>
                <TabsTrigger value="account" className="flex items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your account details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        defaultValue="Sarah Johnson"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        defaultValue="sarah.johnson@belleproperty.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        placeholder="Job title"
                        defaultValue="Sales Manager"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="A brief description about yourself"
                        defaultValue="Experienced sales manager with over 10 years in property management and real estate."
                      />
                    </div>
                    <Button className="mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how the dashboard looks and feels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loading ? (
                      <div className="py-8 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          <p className="text-sm text-muted-foreground">
                            Loading settings...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">
                            Agency Branding
                          </h3>

                          <div className="space-y-2">
                            <Label htmlFor="company-name">Company Name</Label>
                            <Input
                              id="company-name"
                              placeholder="Enter your company name"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              This name will be displayed on the TV view
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="logo-upload">Company Logo</Label>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="border rounded-md p-2 bg-gray-50 flex items-center justify-center">
                                  <div className="w-40 h-16 relative overflow-hidden rounded-md">
                                    {logoUrl ? (
                                      <img
                                        src={logoUrl}
                                        alt="Company Logo"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = "none";
                                          setLogoUrl("");
                                        }}
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                                        No logo uploaded
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {/* Hidden file input */}
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleLogoUpload}
                                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                  className="hidden"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={triggerFileUpload}
                                  disabled={uploading}
                                >
                                  {uploading ? (
                                    <>
                                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>{" "}
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="mr-2 h-4 w-4" /> Upload
                                      Logo
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={handleRemoveLogo}
                                  disabled={!logoUrl || uploading}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                            {error && (
                              <p className="text-xs text-red-500 mt-1">
                                {error}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Recommended size: 300 x 120 pixels
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                          <Button className="mt-2" onClick={saveSettings}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Agency Settings
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                      Import, export, and manage your data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Import Data</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload CSV files to import property transactions
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".csv"
                          id="import-file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const formData = new FormData();
                              formData.append("file", file);

                              fetch("/api/import/csv", {
                                method: "POST",
                                body: formData,
                              })
                                .then((response) => response.json())
                                .then((data) => {
                                  if (data.success) {
                                    alert("Data imported successfully!");
                                    // Reset the file input
                                    e.target.value = "";
                                  } else {
                                    throw new Error(
                                      data.message || "Import failed",
                                    );
                                  }
                                })
                                .catch((error) => {
                                  console.error("Import error:", error);
                                  alert(
                                    `Failed to import data: ${error.message}`,
                                  );
                                });
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() =>
                            document.getElementById("import-file")?.click()
                          }
                        >
                          <ArrowUpFromLine className="mr-2 h-4 w-4" />
                          Upload CSV
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Download template
                            fetch("/api/template/csv")
                              .then((response) => {
                                if (!response.ok)
                                  throw new Error(
                                    "Failed to download template",
                                  );
                                return response.blob();
                              })
                              .then((blob) => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.style.display = "none";
                                a.href = url;
                                a.download = "property_template.csv";
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                              })
                              .catch((error) => {
                                console.error(
                                  "Template download error:",
                                  error,
                                );
                                alert("Failed to download template");
                              });
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Download Template
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                      <Label>Export Data</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Download your data as CSV
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            fetch("/api/export/transactions/csv")
                              .then((response) => {
                                if (!response.ok)
                                  throw new Error("Export failed");
                                return response.blob();
                              })
                              .then((blob) => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.style.display = "none";
                                a.href = url;
                                a.download = "transactions.csv";
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                              })
                              .catch((error) => {
                                console.error("Export error:", error);
                                alert("Failed to export data");
                              });
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Export as CSV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
