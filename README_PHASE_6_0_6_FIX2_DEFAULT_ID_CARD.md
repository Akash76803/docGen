# Phase 6.0.6 Fix2 — Default Corporate Employee ID Card Template

Adds an editable built-in CR80 (85.60 × 53.98 mm) Corporate Employee ID Card starter template to Card Designer.

## Included
- Front + Back artboards
- Editable shapes and text; no flattened image
- Company header/logo placeholder, employee photo placeholder, name/designation/ID/department and QR placeholder
- Back-side company address, emergency contact, validity, blood group, authorized signature line, return instructions
- 3 mm bleed and 3 mm safe-area metadata on both artboards
- Dynamic binding metadata prepared for Employee.Name, Employee.Designation, Employee.EmployeeId, Employee.Department, Employee.QR, Employee.EmergencyContact, Employee.ValidUntil and Employee.BloodGroup
- Starter Templates control in Card Designer and an ID Card Template command-bar shortcut
- Factory lives in the shared design engine so it can later be surfaced by the full Template Library without hard-coded renderer behavior

## Verification performed in this environment
- @document-tool/contracts build: PASS
- @document-tool/design-engine build: PASS
- Starter template construction: PASS
- validateDesignTemplate(): PASS
- Front elements: 19
- Back elements: 15

Full workspace/UI test requires the project's installed node_modules in the Windows development environment.
