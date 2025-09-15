import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Search, Save, Send, Plus } from "lucide-react";

export default function ProgressCapture() {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState("");
  
  // Mock data for activities
  const activities = [
    {
      id: "A-0001",
      name: "Soldadura spool 2\"",
      unit: "u",
      boqQty: 120,
      executed: 78,
      todayQty: 0,
      progress: 65,
      comment: "",
      photos: []
    },
    {
      id: "A-0002", 
      name: "Soportes tubería",
      unit: "m",
      boqQty: 300,
      executed: 185,
      todayQty: 0,
      progress: 62,
      comment: "",
      photos: []
    },
    {
      id: "A-0101",
      name: "Tendido bandeja principal",
      unit: "m", 
      boqQty: 200,
      executed: 145,
      todayQty: 0,
      progress: 73,
      comment: "",
      photos: []
    }
  ];

  const [progressEntries, setProgressEntries] = useState(activities);

  const updateEntry = (id: string, field: string, value: any) => {
    setProgressEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Progress Entry</h1>
          <p className="text-muted-foreground">Record today's construction progress</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Mobile Optimized
        </Badge>
      </div>

      {/* Project Selection */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle className="text-lg">Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FP01">FieldProgress Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shift">Shift</Label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIA">Day Shift</SelectItem>
                  <SelectItem value="NOCHE">Night Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Search */}
      <Card className="construction-card">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by activity code or name..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Entry Table */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
          <CardDescription>Enter quantities completed today for each activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity Code</TableHead>
                  <TableHead>Activity Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>BOQ Qty</TableHead>
                  <TableHead>Executed</TableHead>
                  <TableHead>Today</TableHead>
                  <TableHead>Progress %</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Photos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono font-medium">{entry.id}</TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell className="font-mono">{entry.unit}</TableCell>
                    <TableCell className="font-mono">{entry.boqQty}</TableCell>
                    <TableCell className="font-mono">{entry.executed}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={entry.todayQty}
                        onChange={(e) => updateEntry(entry.id, 'todayQty', parseFloat(e.target.value) || 0)}
                        className="w-20 font-mono"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={entry.progress > 80 ? "default" : entry.progress > 50 ? "secondary" : "outline"}
                      >
                        {entry.progress}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={entry.comment}
                        onChange={(e) => updateEntry(entry.id, 'comment', e.target.value)}
                        placeholder="Comments..."
                        className="min-w-[200px] min-h-[60px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Add ({entry.photos.length})
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button variant="default" className="industrial-gradient">
          <Send className="mr-2 h-4 w-4" />
          Submit for Approval
        </Button>
      </div>
    </div>
  );
}