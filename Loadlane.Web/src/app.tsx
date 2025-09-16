import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Check,
  ChevronDown,
  Info,
  Loader2,
  Menu,
  PlusCircle,
  TriangleAlert,
} from "lucide-react";

/**
 * Brand Identity Demo – shadcn/ui
 *
 * Drop this file into your app (e.g., app/brand-demo/page.tsx for Next.js App Router)
 * or src/pages/BrandDemo.tsx for a Vite/SPA. Assumes shadcn/ui + Tailwind are installed
 * and CSS variables are defined on :root / .dark.
 */
export default function BrandDemoPage() {
  return (
    <TooltipProvider>
      <div className="mx-auto max-w-screen-2xl space-y-10 p-6 sm:p-10">
        <HeaderBar />
        <PaletteCards />
        <ButtonsRow onToast={() => {}} />
        <FormsAndInputs />
        <DataAndFeedback />
        <Overlays />
        <TypographyAndBadges />
      </div>
    </TooltipProvider>
  );
}

function HeaderBar() {
  return (
    <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-2 border-b bg-background/80 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-xl font-semibold tracking-tight">
            Loadlane Brand Demo
          </div>
          <Breadcrumb className="ml-2 hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Brand Demo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/40" alt="User" />
            <AvatarFallback>LL</AvatarFallback>
          </Avatar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                Actions <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>New Shipment</DropdownMenuItem>
              <DropdownMenuItem>Invite Team</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-3">
      <div
        className="size-12 rounded-lg"
        style={{ background: `var(${varName})` }}
      />
      <div className="grid">
        <span className="text-sm font-medium">{name}</span>
        <code className="text-xs text-muted-foreground">{varName}</code>
      </div>
    </div>
  );
}

function PaletteCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>
            Primary & accent derived from Rhenus palette
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Swatch name="Primary" varName="--primary" />
          <Swatch name="On Primary" varName="--primary-foreground" />
          <Swatch name="Accent" varName="--accent" />
          <Swatch name="On Accent" varName="--accent-foreground" />
          <Swatch name="Destructive" varName="--destructive" />
          <Swatch name="Ring" varName="--ring" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Surface & Text</CardTitle>
          <CardDescription>Backgrounds and foregrounds</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Swatch name="Background" varName="--background" />
          <Swatch name="Foreground" varName="--foreground" />
          <Swatch name="Card" varName="--card" />
          <Swatch name="Card Foreground" varName="--card-foreground" />
          <Swatch name="Popover" varName="--popover" />
          <Swatch name="Popover Foreground" varName="--popover-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primitives</CardTitle>
          <CardDescription>Borders, inputs, sidebar</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Swatch name="Border" varName="--border" />
          <Swatch name="Input" varName="--input" />
          <Swatch name="Sidebar" varName="--sidebar" />
          <Swatch name="Sidebar Foreground" varName="--sidebar-foreground" />
          <Swatch name="Sidebar Primary" varName="--sidebar-primary" />
          <Swatch name="Sidebar Accent" varName="--sidebar-accent" />
        </CardContent>
      </Card>
    </div>
  );
}

function ButtonsRow({ onToast }: { onToast: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buttons & CTAs</CardTitle>
        <CardDescription>Variants driven by your CSS variables</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add item</TooltipContent>
        </Tooltip>
        <Button onClick={onToast} className="ml-auto">
          Show Toast
        </Button>
      </CardContent>
    </Card>
  );
}

function FormsAndInputs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forms, Inputs & Selection</CardTitle>
        <CardDescription>States, focus rings, and layout</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Short title" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Write a message…" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="subscribe" />
              <Label htmlFor="subscribe">Subscribe to updates</Label>
            </div>
            <Button>Send</Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Mode</Label>
            <RadioGroup defaultValue="auto" className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto">Auto</Label>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem value="road" id="road" />
                <Label htmlFor="road">Road</Label>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem value="air" id="air" />
                <Label htmlFor="air">Air</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select defaultValue="de">
              <SelectTrigger id="country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="nl">Netherlands</SelectItem>
                <SelectItem value="pl">Poland</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Popover Helper</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Choose something <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <p className="text-sm text-muted-foreground">
                  Place any interactive helper here (e.g., calendar, quick
                  picks).
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DataAndFeedback() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Table</CardTitle>
          <CardDescription>
            Density, borders and zebra striping via classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: "LL-1023",
                  status: "Confirmed",
                  mode: "Road",
                  value: 1250,
                },
                { id: "LL-1024", status: "Draft", mode: "Air", value: 3570 },
                { id: "LL-1025", status: "Shipped", mode: "Sea", value: 980 },
              ].map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status === "Shipped" ? "default" : "secondary"}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.mode}</TableCell>
                  <TableCell className="text-right">
                    € {r.value.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Progress value={62} aria-label="Progress" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alerts & Accordions</CardTitle>
          <CardDescription>Messaging and content density</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              This is a neutral message using foreground and accent variables.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              Double‑check your connection and retry.
            </AlertDescription>
          </Alert>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Brand decisions</AccordionTrigger>
              <AccordionContent>
                Primary buttons use brand blue; emphasis content uses accent.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Accessibility</AccordionTrigger>
              <AccordionContent>
                Contrast ratios meet AA for key components; verify against your
                content.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function Overlays() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Dialog & Sheet</CardTitle>
          <CardDescription>Surfaces over brand colors</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm changes</DialogTitle>
                <DialogDescription>
                  Your updates will be applied immediately.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline">Cancel</Button>
                <Button>
                  <Check className="mr-2 h-4 w-4" /> Confirm
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Adjust your view parameters.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span>Only active</span>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label>Mode</Label>
                  <Select defaultValue="road">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="road">Road</SelectItem>
                      <SelectItem value="air">Air</SelectItem>
                      <SelectItem value="sea">Sea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popover & Tooltip</CardTitle>
          <CardDescription>Micro-interactions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="text-sm">
                Popovers inherit surface variables; verify spacing and shadows.
              </p>
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip using foreground on surface</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </div>
  );
}

function TypographyAndBadges() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Typography & Badges</CardTitle>
        <CardDescription>
          Headings, paragraphs, and emphasis tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
            H1 – Logistics reimagined
          </h1>
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            H2 – Ship faster with Loadlane
          </h2>
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            H3 – Reliable by default
          </h3>
          <p className="text-muted-foreground">
            Body – Use this area to confirm copy legibility on light and dark
            backgrounds.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            Your brand primary drives active tabs; verify hover and focus
            states.
          </TabsContent>
          <TabsContent value="details">Detail content…</TabsContent>
          <TabsContent value="history">Change log…</TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">
          Check components in dark mode too.
        </span>
        <Button variant="outline">View Guidelines</Button>
      </CardFooter>
    </Card>
  );
}
