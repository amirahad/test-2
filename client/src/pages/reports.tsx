import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Sidebar } from "@/components/layout/sidebar";
import {
  FileBarChart,
  Users,
  PlusCircle,
  Download,
  FileText,
  Save,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetSelector } from "@/components/reports/widget-selector";
import { ReportContent } from "@/components/reports/report-content";
import { dateRangeOptions } from "@/lib/utils";
import html2pdf from "html2pdf.js";

// Mock function for UUID since we don't have the actual package
function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export default function ReportsPage() {
  // State for report configuration
  const [reportType, setReportType] = useState("agency");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [period, setPeriod] = useState("6months");
  const [reportTitle, setReportTitle] = useState("Sales Performance Report");
  const [reportNotes, setReportNotes] = useState("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [lastPageTitle, setLastPageTitle] = useState("Thank You");
  const [lastPageDescription, setLastPageDescription] = useState(
    "Thank you for reviewing this report. For more detailed information or to discuss these results further, please don't hesitate to contact us.",
  );
  const [isExporting, setIsExporting] = useState(false);
  const [chartColors, setChartColors] = useState({
    primary: "#2563eb", // Blue
    secondary: "#16a34a", // Green
    tertiary: "#d97706", // Amber
    quaternary: "#db2777", // Pink
  });
  const [widgets, setWidgets] = useState<{ id: string; type: string }[]>([
    { id: generateId(), type: "monthly-sales" },
    { id: generateId(), type: "sales-by-property-type" },
  ]);
  const [widgetSelectorOpen, setWidgetSelectorOpen] = useState(false);
  // Reference to cover image file input
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);

  // Define types for our data
  interface Agent {
    id: number;
    name: string;
    photoUrl?: string;
    [key: string]: any;
  }

  interface Setting {
    key: string;
    value: string;
    category: string;
    [key: string]: any;
  }

  // Fetch agents data
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Fetch settings data
  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  // Extract branding settings
  const brandingSettings =
    settings.filter((setting) => setting.category === "branding") || [];

  const handleWidgetAdd = (widgetType: string) => {
    setWidgets([...widgets, { id: generateId(), type: widgetType }]);
  };

  const handleWidgetRemove = (widgetId: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== widgetId));
  };

  const handleReportTypeChange = (value: string) => {
    setReportType(value);
    if (value === "agency") {
      setSelectedAgent("");
    }
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  const handleAgentChange = (value: string) => {
    setSelectedAgent(value);
  };

  const handleCoverImageUpload = (
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
      alert("Please select a valid image file (JPEG, PNG, GIF, SVG, or WEBP)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit");
      return;
    }

    // Create a URL for the selected file for preview
    const imageUrl = URL.createObjectURL(file);
    setCoverImage(imageUrl);
  };

  const handleColorChange = (key: keyof typeof chartColors, value: string) => {
    setChartColors((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Helper function to get widget title
  const getWidgetTitle = (type: string) => {
    switch (type) {
      case "total-properties-sold":
        return "Properties Sold";
      case "total-revenue":
        return "Total Revenue";
      case "average-selling-price":
        return "Average Selling Price";
      case "average-days-on-market":
        return "Average Days on Market";
      case "sales-by-property-type":
        return "Sales by Property Type";
      case "monthly-sales":
        return "Monthly Sales Performance";
      case "top-sales":
        return "Top 5 Sales";
      case "agent-leaderboard":
        return "Agent Performance";
      case "text-section":
        return "Text Section";
      case "section-title":
        return "Section Title";
      default:
        return "Widget";
    }
  };

  const handleExportPdf = () => {
    setIsExporting(true); // Set loading state to true when starting export
    // Create a temporary container for PDF export
    const pdfContainer = document.createElement("div");
    pdfContainer.style.position = "absolute";
    pdfContainer.style.left = "-9999px";
    pdfContainer.style.top = "-9999px";
    document.body.appendChild(pdfContainer);

    // Use current state values instead of React hooks
    const companyName =
      brandingSettings.find((setting: any) => setting.key === "company_name")
        ?.value || "Estate Dashboard";
    const logoUrl =
      brandingSettings.find((setting: any) => setting.key === "logo_url")
        ?.value || "";

    // Get agent data if this is an agent report
    const agentData = selectedAgent
      ? {
          name:
            agents.find((a: any) => a.id.toString() === selectedAgent)?.name ||
            "",
          photoUrl:
            agents.find((a: any) => a.id.toString() === selectedAgent)
              ?.photoUrl || "",
        }
      : undefined;

    // Render our PDF-specific component
    import("@/components/reports/pdf-report").then(({ PdfReport }) => {
      import("@/components/reports/pdf-report-content").then(
        ({ PdfReportContent }) => {
          // This will use ReactDOM.render in a real app, but for this task we'll use a simplified approach
          pdfContainer.innerHTML = `
          <div class="pdf-export-wrapper" style="width: 210mm; background: white; color: black;">
            <!-- Cover Page -->
            <div style="page-break-after: always; height: 297mm; position: relative; padding: 2cm; display: flex; flex-direction: column; justify-content: space-between;">
              ${
                coverImage
                  ? `
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0; opacity: 0.1;">
                  <img 
                    src="${coverImage}" 
                    alt="Cover background" 
                    style="width: 100%; height: 100%; object-fit: cover;"
                  />
                </div>
              `
                  : ""
              }
              
              <div style="margin-bottom: 3cm; position: relative; z-index: 1;"></div>
              
              <div style="text-align: center; position: relative; z-index: 1;">
                ${
                  logoUrl
                    ? `
                  <div style="margin-bottom: 2cm;">
                    <img 
                      src="${logoUrl}" 
                      alt="${companyName}" 
                      style="max-width: 200px; max-height: 80px;"
                    />
                  </div>
                `
                    : ""
                }
                
                <h1 style="font-size: 28pt; font-weight: bold; margin-bottom: 1cm; color: #000;">
                  ${reportTitle}
                </h1>
                
                <p style="font-size: 14pt; margin-bottom: 0.5cm; color: #444;">
                  ${dateRangeOptions.find((option) => option.value === period)?.label || period}
                </p>
                
                ${
                  selectedAgent
                    ? `
                  <p style="font-size: 14pt; margin-bottom: 0.5cm; color: #444;">
                    Agent: ${agents.find((a: any) => a.id.toString() === selectedAgent)?.name || ""}
                  </p>
                `
                    : ""
                }
              </div>
              
              ${
                reportNotes
                  ? `
                <div style="margin-top: 2cm; padding: 1cm; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; position: relative; z-index: 1;">
                  <p style="font-size: 12pt; line-height: 1.5;">${reportNotes}</p>
                </div>
              `
                  : ""
              }
              
              <div style="margin-top: auto; text-align: center; color: #777; font-size: 10pt; position: relative; z-index: 1;">
                Generated on ${new Date().toLocaleDateString()}
              </div>
            </div>
            
            <!-- Report Content -->
            <div id="pdf-report-content" style="padding: 1cm;"></div>
            
            <!-- Final Page -->
            <div style="page-break-before: always; padding: 2cm; display: flex; flex-direction: column; height: 297mm;">
              <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                ${
                  reportType === "agency"
                    ? `
                  ${
                    logoUrl
                      ? `
                    <img 
                      src="${logoUrl}" 
                      alt="${companyName}" 
                      style="max-width: 200px; max-height: 80px; margin-bottom: 1cm;"
                    />
                  `
                      : ""
                  }
                  <h2 style="font-size: 18pt; font-weight: bold; margin-bottom: 1cm;">
                    ${companyName}
                  </h2>
                `
                    : agentData
                      ? `
                  ${
                    agentData.photoUrl
                      ? `
                    <div style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden; margin-bottom: 1cm; border: 1px solid #ddd;">
                      <img 
                        src="${agentData.photoUrl}" 
                        alt="${agentData.name}"
                        style="width: 100%; height: 100%; object-fit: cover;"
                      />
                    </div>
                  `
                      : ""
                  }
                  <h2 style="font-size: 18pt; font-weight: bold; margin-bottom: 0.5cm;">
                    ${agentData.name}
                  </h2>
                  <p style="font-size: 12pt; color: #444;">
                    Sales Agent
                  </p>
                `
                      : ""
                }
                
                <div style="margin-top: 2cm; padding: 1cm; border: 1px solid #ddd; max-width: 80%; border-radius: 4px;">
                  <p style="font-size: 12pt; font-style: italic; line-height: 1.5; color: #444; text-align: left;">
                    ${lastPageDescription}
                  </p>
                </div>
              </div>
              
              <div style="margin-top: auto; text-align: center; border-top: 1px solid #ddd; padding-top: 1cm; font-size: 10pt; color: #777;">
                <p>${companyName} • ${new Date().getFullYear()}</p>
                <p>Confidential Report</p>
              </div>
            </div>
          </div>
        `;

          // Now render all the widgets in a simplified version without UI controls
          const contentContainer = pdfContainer.querySelector(
            "#pdf-report-content",
          );
          if (contentContainer) {
            // Create content markup
            let contentHTML = '<div style="page-break-inside: avoid;">';

            // Group widgets into pairs for a two-column layout
            const widgetPairs = [];
            for (let i = 0; i < widgets.length; i += 2) {
              widgetPairs.push(widgets.slice(i, i + 2));
            }

            widgetPairs.forEach((pair, pairIndex) => {
              contentHTML += `
              <div style="display: flex; margin-bottom: 20px; page-break-inside: avoid;">
                ${pair
                  .map(
                    (widget) => `
                  <div style="flex: 1; margin: 0 10px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; background: #fff; page-break-inside: avoid;">
                    <div style="padding: 10px;">
                      <h3 style="font-size: 16pt; margin-bottom: 10px; text-align: center;">
                        ${getWidgetTitle(widget.type)}
                      </h3>
                      <div id="widget-placeholder-${widget.id}" style="min-height: 150px;"></div>
                    </div>
                  </div>
                `,
                  )
                  .join("")}
                ${pair.length === 1 ? '<div style="flex: 1; margin: 0 10px;"></div>' : ""}
              </div>
            `;
            });

            contentHTML += "</div>";
            contentContainer.innerHTML = contentHTML;

            // Now we would need to render each widget's content into the placeholders
            // For the sake of this implementation, we'll capture the widget content from the DOM
            const captureWidgetContent = () => {
              widgets.forEach((widget) => {
                // Look for the actual widget by its ID
                const originalWidget = document.querySelector(
                  `[data-widget-id="${widget.id}"] .widget-content`,
                );
                const placeholder = pdfContainer.querySelector(
                  `#widget-placeholder-${widget.id}`,
                );

                if (originalWidget && placeholder) {
                  // Clone the content without UI controls
                  const clone = originalWidget.cloneNode(true) as HTMLElement;

                  // Remove any interactive elements that shouldn't be in the PDF
                  const buttons = clone.querySelectorAll("button");
                  buttons.forEach((button) => button.remove());

                  // Also remove dropdown menus and any other interactive controls
                  const dropdowns = clone.querySelectorAll(
                    ".dropdown-menu, [data-radix-popper-content-wrapper]",
                  );
                  dropdowns.forEach((dropdown) => dropdown.remove());

                  // Add the content to the PDF
                  placeholder.appendChild(clone);
                } else {
                  console.error(`Could not find widget with ID ${widget.id}`);
                  if (!originalWidget)
                    console.error(`Original widget not found for ${widget.id}`);
                  if (!placeholder)
                    console.error(`Placeholder not found for ${widget.id}`);
                }
              });
            };

            // In a real implementation, we'd need to ensure all charts are rendered
            // before capturing their content
            setTimeout(() => {
              captureWidgetContent();

              // Generate the PDF
              const options = {
                margin: 0,
                filename: `${reportTitle.replace(/\s+/g, "_")}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                  scale: 2,
                  useCORS: true,
                  logging: true,
                  letterRendering: true,
                },
                jsPDF: {
                  unit: "mm",
                  format: "a4",
                  orientation: "portrait" as "portrait" | "landscape",
                  compress: true,
                },
              };

              const pdfInstance = html2pdf().set(options).from(pdfContainer);
              pdfInstance.save();

              // Clean up after a delay to ensure PDF generation is complete
              setTimeout(() => {
                document.body.removeChild(pdfContainer);
                setIsExporting(false); // Reset loading state after PDF generation
              }, 2000);
            }, 3000); // Increase the wait time to ensure charts fully render
          }
        },
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageHeader
            title="Sales Reports"
            subtitle="Create custom reports for your real estate agency"
            actions={
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleExportPdf}
                  className="flex items-center gap-1"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export PDF
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setWidgetSelectorOpen(true)}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Widget
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Configuration Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>Customize your sales report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Report type selection */}
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select
                      value={reportType}
                      onValueChange={handleReportTypeChange}
                    >
                      <SelectTrigger id="report-type">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agency">Agency Report</SelectItem>
                        <SelectItem value="agent">Agent Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Agent selection (only visible for agent reports) */}
                  {reportType === "agent" && (
                    <div className="space-y-2">
                      <Label htmlFor="agent">Select Agent</Label>
                      <Select
                        value={selectedAgent}
                        onValueChange={handleAgentChange}
                      >
                        <SelectTrigger id="agent">
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent: any) => (
                            <SelectItem
                              key={agent.id}
                              value={agent.id.toString()}
                            >
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Time range selection */}
                  <div className="space-y-2">
                    <Label htmlFor="time-range">Time Range</Label>
                    <Select value={period} onValueChange={handlePeriodChange}>
                      <SelectTrigger id="time-range">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateRangeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Report title */}
                  <div className="space-y-2">
                    <Label htmlFor="report-title">Report Title</Label>
                    <Input
                      id="report-title"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                    />
                  </div>

                  {/* Report notes */}
                  <div className="space-y-2">
                    <Label htmlFor="report-notes">Notes</Label>
                    <Textarea
                      id="report-notes"
                      placeholder="Add any additional notes here..."
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Chart Colors Configuration */}
                  <div className="space-y-3 pt-2 border-t">
                    <Label className="text-base">Chart Colors</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="primary-color"
                          className="text-xs flex items-center gap-2"
                        >
                          Primary
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: chartColors.primary }}
                          ></div>
                        </Label>
                        <Input
                          id="primary-color"
                          type="color"
                          value={chartColors.primary}
                          onChange={(e) =>
                            handleColorChange("primary", e.target.value)
                          }
                          className="h-8 p-1 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="secondary-color"
                          className="text-xs flex items-center gap-2"
                        >
                          Secondary
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: chartColors.secondary }}
                          ></div>
                        </Label>
                        <Input
                          id="secondary-color"
                          type="color"
                          value={chartColors.secondary}
                          onChange={(e) =>
                            handleColorChange("secondary", e.target.value)
                          }
                          className="h-8 p-1 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="tertiary-color"
                          className="text-xs flex items-center gap-2"
                        >
                          Tertiary
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: chartColors.tertiary }}
                          ></div>
                        </Label>
                        <Input
                          id="tertiary-color"
                          type="color"
                          value={chartColors.tertiary}
                          onChange={(e) =>
                            handleColorChange("tertiary", e.target.value)
                          }
                          className="h-8 p-1 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="quaternary-color"
                          className="text-xs flex items-center gap-2"
                        >
                          Quaternary
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: chartColors.quaternary }}
                          ></div>
                        </Label>
                        <Input
                          id="quaternary-color"
                          type="color"
                          value={chartColors.quaternary}
                          onChange={(e) =>
                            handleColorChange("quaternary", e.target.value)
                          }
                          className="h-8 p-1 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="cover-image" className="text-base">
                      Cover Image
                    </Label>
                    <div className="flex flex-col gap-3">
                      {coverImage && (
                        <div className="relative border rounded-md overflow-hidden">
                          <img
                            src={coverImage}
                            alt="Cover preview"
                            className="w-full h-[120px] object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-7 w-7 p-0"
                            onClick={() => setCoverImage("")}
                          >
                            ✕
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => coverImageInputRef.current?.click()}
                          className="text-xs"
                        >
                          {coverImage ? "Change Image" : "Upload Image"}
                        </Button>
                        <p className="text-xs text-gray-500">
                          Recommended size: 1200x800px (max 2MB)
                        </p>
                        <input
                          ref={coverImageInputRef}
                          type="file"
                          id="cover-image"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
                <Button className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
              </CardFooter>
            </Card>

            {/* Report Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                  {reportType === "agency"
                    ? "Agency-wide report"
                    : "Agent-specific report"}
                  {" • "}
                  {dateRangeOptions.find((option) => option.value === period)
                    ?.label || period}
                </CardDescription>
              </CardHeader>
              <CardContent id="report-preview" className="space-y-4">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-bold">{reportTitle}</h2>
                  {reportNotes && (
                    <p className="text-sm text-gray-500 mt-2">{reportNotes}</p>
                  )}
                </div>

                <ReportContent
                  widgets={widgets}
                  agentId={selectedAgent ? Number(selectedAgent) : undefined}
                  period={period}
                  onRemoveWidget={handleWidgetRemove}
                />

                {widgets.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FileBarChart className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">
                      No widgets added
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mt-2">
                      Click the "Add Widget" button to select data
                      visualizations for your report.
                    </p>
                    <Button
                      onClick={() => setWidgetSelectorOpen(true)}
                      className="mt-4"
                    >
                      Add Your First Widget
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 text-sm text-gray-500">
                {widgets.length > 0 && (
                  <div className="flex justify-between w-full">
                    <span>
                      {widgets.length} widget{widgets.length !== 1 ? "s" : ""}{" "}
                      in report
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 flex items-center gap-1"
                      onClick={() => setWidgetSelectorOpen(true)}
                    >
                      <PlusCircle className="h-3 w-3" />
                      Add More Widgets
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>

      {/* Widget Selector Dialog */}
      <WidgetSelector
        open={widgetSelectorOpen}
        onOpenChange={setWidgetSelectorOpen}
        onWidgetSelect={handleWidgetAdd}
      />
    </div>
  );
}
