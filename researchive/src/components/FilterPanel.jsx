// src/components/FilterPanel.jsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FilterPanel = ({ filters, onApplyFilters }) => {
  const [yearRange, setYearRange] = useState(filters.year || '');
  const [openAccessOnly, setOpenAccessOnly] = useState(filters.openAccessPdf || false);
  const [selectedFields, setSelectedFields] = useState(filters.fieldsOfStudy || []);

  const fieldsOfStudy = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Medicine',
    'Biology',
    'Psychology',
    'Economics',
    'Philosophy',
    'Engineering',
    'Chemistry'
  ];

  const handleFieldToggle = (field) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      year: yearRange,
      openAccessPdf: openAccessOnly,
      fieldsOfStudy: selectedFields
    });
  };

  return (
    <Card className="w-full">
  <CardHeader>
    <CardTitle>Filter Results</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="year-range">Publication Year Range</Label>
      <Input
        id="year-range"
        placeholder="e.g., 2020-2023"
        value={yearRange}
        onChange={(e) => setYearRange(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">Format: YYYY or YYYY-YYYY</p>
    </div>

    <div className="flex items-center space-x-2">
      <Checkbox
        id="open-access"
        checked={openAccessOnly}
        onCheckedChange={setOpenAccessOnly}
      />
      <Label htmlFor="open-access">Open Access Papers Only</Label>
    </div>

    <div className="space-y-2">
      <Label className="text-sm">Fields of Study</Label>
      <div className="grid grid-cols-2 gap-2">
        {fieldsOfStudy.map(field => (
          <div key={field} className="flex items-center space-x-2">
            <Checkbox
              id={`field-${field}`}
              checked={selectedFields.includes(field)}
              onCheckedChange={() => handleFieldToggle(field)}
              className="flex-shrink-0"
            />
            <Label htmlFor={`field-${field}`} className="text-xs">
              {field}
            </Label>
          </div>
        ))}
      </div>
    </div>

    <Button onClick={handleApplyFilters} className="w-full">
      Apply Filters
    </Button>
  </CardContent>
</Card>
  );
};

export default FilterPanel;